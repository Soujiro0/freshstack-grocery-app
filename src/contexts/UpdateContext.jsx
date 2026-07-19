import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Network } from '@capacitor/network'
import { Preferences } from '@capacitor/preferences'
import packageJson from '../../package.json'

const UpdateContext = createContext()

export function UpdateProvider({ children }) {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [latestVersion, setLatestVersion] = useState('')
  const [hasUpdate, setHasUpdate] = useState(false) // For the sidebar button

  const checkForUpdate = useCallback(async (manual = false) => {
    try {
      const status = await Network.getStatus()
      if (!status.connected) return

      const res = await fetch('https://api.github.com/repos/Soujiro0/freshstack-grocery-app/releases/latest')
      if (!res.ok) return
      const data = await res.json()
      
      const tag = data.tag_name || ''
      const latestVer = tag.replace(/^v/, '')
      const currentVer = packageJson.version

      if (compareVersions(latestVer, currentVer) > 0) {
        setLatestVersion(latestVer)
        setDownloadUrl(data.html_url)
        setHasUpdate(true)
        
        if (manual) {
          setUpdateAvailable(true)
        } else {
          // Check 24h cooldown
          const { value } = await Preferences.get({ key: 'lastUpdateCheck' })
          const lastCheck = value ? parseInt(value, 10) : 0
          const now = Date.now()
          const oneDay = 24 * 60 * 60 * 1000
          
          if (now - lastCheck > oneDay) {
            setUpdateAvailable(true)
          }
        }
      } else {
        setHasUpdate(false)
        if (manual) {
          alert('You are on the latest version!')
        }
      }
    } catch (e) {
      console.error('Failed to check for update', e)
    }
  }, [])

  useEffect(() => {
    checkForUpdate(false)
  }, [checkForUpdate])

  const dismissUpdate = async () => {
    setUpdateAvailable(false)
    await Preferences.set({ key: 'lastUpdateCheck', value: Date.now().toString() })
  }

  return (
    <UpdateContext.Provider value={{ updateAvailable, hasUpdate, latestVersion, downloadUrl, dismissUpdate, checkForUpdate }}>
      {children}
    </UpdateContext.Provider>
  )
}

export const useUpdate = () => useContext(UpdateContext)

function compareVersions(v1, v2) {
  const p1 = v1.split('.').map(Number)
  const p2 = v2.split('.').map(Number)
  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const num1 = p1[i] || 0
    const num2 = p2[i] || 0
    if (num1 > num2) return 1
    if (num1 < num2) return -1
  }
  return 0
}
