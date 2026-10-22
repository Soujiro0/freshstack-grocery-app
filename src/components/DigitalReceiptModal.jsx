import { useState, useRef, useEffect } from 'react'
import { toPng } from 'html-to-image'
import { Download, ArrowLeft, ShoppingCart, CheckCircle2, Loader2, Share2 } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { buildReceiptFilename, saveReceiptImage, shareReceiptImage } from '../utils/receiptExport'

export default function DigitalReceiptModal({ isOpen, onClose, checkedItems = [], totalPrice = 0 }) {
  const [busyAction, setBusyAction] = useState(null) // 'save' | 'share' | null
  const [savedLocation, setSavedLocation] = useState(null)
  const [receiptNumber] = useState(() => Math.floor(100000 + Math.random() * 900000))
  const receiptRef = useRef(null)
  const isNative = Capacitor.isNativePlatform()
  const isBusy = busyAction !== null

  useEffect(() => {
    if (isOpen) setSavedLocation(null)
  }, [isOpen])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      window.scrollTo(0, 0)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const totalPcs = checkedItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
  const currentDate = new Date().toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const currentTime = new Date().toLocaleTimeString('en-PH', {
    hour: '2-digit',
    minute: '2-digit',
  })

  async function renderReceiptPng() {
    return toPng(receiptRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: '#FFFFFF',
    })
  }

  async function handleDownloadImage() {
    if (!receiptRef.current) return
    setBusyAction('save')
    try {
      const dataUrl = await renderReceiptPng()
      const result = await saveReceiptImage(dataUrl, buildReceiptFilename())
      if (result.method === 'saved') setSavedLocation(result.location)
    } catch (error) {
      console.error('Failed to save digital receipt image:', error)
      alert(
        error?.code === 'PERMISSION_DENIED'
          ? 'Storage permission is needed to save the receipt. Please allow it and try again.'
          : 'Could not save the image right now. Please try again.'
      )
    } finally {
      setBusyAction(null)
    }
  }

  async function handleShareImage() {
    if (!receiptRef.current) return
    setBusyAction('share')
    try {
      const dataUrl = await renderReceiptPng()
      await shareReceiptImage(dataUrl, buildReceiptFilename())
    } catch (error) {
      // Closing the share sheet without picking an app also rejects; ignore that
      if (!/cancel/i.test(error?.message || '')) {
        console.error('Failed to share digital receipt image:', error)
        alert('Could not share the image right now. Please try again.')
      }
    } finally {
      setBusyAction(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cream overflow-y-auto min-h-svh animate-fadeIn">
      {/* Top Sticky Navigation Bar of Pager */}
      <header className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 bg-surface/95 px-4 sm:px-6 py-3.5 backdrop-blur-md shadow-xs">
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl bg-cream border border-border/80 px-3.5 py-2 text-xs sm:text-sm font-extrabold text-warm-dark hover:bg-cream-dark active:scale-95 transition-all shadow-none shrink-0"
          >
            <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
            <span>Back</span>
          </button>
          <div className="sm:hidden text-xs font-black uppercase tracking-wider text-warm-dark">
            Receipt Preview
          </div>
        </div>

        <div className="hidden sm:block text-sm font-black text-warm-dark tracking-tight">
          Digital Receipt Preview
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isBusy || checkedItems.length === 0}
            className="flex-1 sm:flex-none sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-green px-5 py-2.5 text-xs sm:text-sm font-black text-white hover:bg-green-light active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-none"
          >
            {busyAction === 'save' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Image...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4 stroke-[2.5]" />
                <span>Download Receipt (PNG)</span>
              </>
            )}
          </button>
          {isNative && (
            <button
              type="button"
              onClick={handleShareImage}
              disabled={isBusy || checkedItems.length === 0}
              className="flex items-center justify-center gap-2 rounded-xl bg-surface border border-border/80 px-4 py-2.5 text-xs sm:text-sm font-black text-warm-dark hover:bg-cream active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-none shrink-0"
              aria-label="Share receipt"
            >
              {busyAction === 'share' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Share2 className="h-4 w-4 stroke-[2.5]" />
              )}
              <span>Share</span>
            </button>
          )}
        </div>
      </header>

      {savedLocation && (
        <div
          role="status"
          className="mx-auto mt-4 w-full max-w-3xl px-4 sm:px-8"
        >
          <div className="flex items-center gap-2 rounded-xl bg-green-muted border border-green-border px-4 py-3 text-xs sm:text-sm font-bold text-green">
            <CheckCircle2 className="h-4 w-4 shrink-0 stroke-[2.5]" />
            <span className="min-w-0 break-words">
              Saved to your Gallery: {savedLocation}
            </span>
          </div>
        </div>
      )}

      {/* Whole Screen Pager Receipt Content Area */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex flex-col items-center justify-start">
        <div
          ref={receiptRef}
          className="w-full bg-white rounded-2xl p-6 sm:p-12 text-warm-dark font-mono shadow-sm border border-border/40"
        >
          {/* Top Store Header */}
          <div className="text-center pb-6 border-b-2 border-dashed border-border/80 flex flex-col items-center">
            <div className="h-14 w-14 rounded-2xl bg-green/10 text-green flex items-center justify-center mb-3.5 shadow-2xs border border-green/20">
              <ShoppingCart className="h-7 w-7 stroke-[2.5]" />
            </div>
            <div className="font-sans font-black text-2xl sm:text-3xl text-warm-dark tracking-tight">
              FreshTrack Grocery
            </div>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="rounded-full bg-green/15 text-green font-sans font-extrabold px-2.5 py-0.5 text-[10px] uppercase tracking-widest">
                Official Receipt
              </span>
              <span className="text-xs font-sans font-bold text-warm-gray">
                • Philippines
              </span>
            </div>
          </div>

          {/* Receipt Metadata */}
          <div className="py-5 text-xs sm:text-sm text-warm-gray border-b-2 border-dashed border-border/60 space-y-2">
            <div className="flex justify-between">
              <span>RECEIPT NO:</span>
              <span className="font-bold text-warm-dark">#FT-{receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>DATE:</span>
              <span className="text-warm-dark font-semibold">{currentDate}</span>
            </div>
            <div className="flex justify-between">
              <span>TIME:</span>
              <span className="text-warm-dark font-semibold">{currentTime}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-6">
            <div className="grid grid-cols-12 text-xs sm:text-sm font-black text-warm-gray uppercase border-b-2 border-border/80 pb-3 mb-4">
              <div className="col-span-5">Item</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {checkedItems.map((item) => {
                const q = item.quantity || 1
                const p = item.price || 0
                const sub = q * p
                return (
                  <div key={item.id} className="grid grid-cols-12 items-baseline gap-2">
                    <div className="col-span-5 font-bold break-words pr-2 text-warm-dark font-sans text-sm sm:text-base">
                      {item.name}
                    </div>
                    <div className="col-span-2 text-center text-warm-gray font-bold">
                      {q} pcs
                    </div>
                    <div className="col-span-2 text-right text-warm-gray font-semibold">
                      ₱{p.toFixed(2)}
                    </div>
                    <div className="col-span-3 text-right font-black text-warm-dark text-sm sm:text-base">
                      ₱{sub.toFixed(2)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Totals Section */}
          <div className="pt-6 mt-4 border-t-2 border-dashed border-border/80 space-y-3">
            <div className="flex justify-between text-xs sm:text-sm text-warm-gray">
              <span>Total Items:</span>
              <span className="font-bold text-warm-dark">
                {checkedItems.length} items ({totalPcs} pcs)
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-4 border-t border-border/60 text-xl sm:text-3xl font-black text-green">
              <span className="font-sans">GRAND TOTAL:</span>
              <span>
                ₱
                {totalPrice.toLocaleString('en-PH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {/* Footer / Thank You Note */}
          <div className="mt-10 pt-6 border-t-2 border-dashed border-border/80 text-center space-y-3">
            <p className="font-sans text-sm sm:text-base font-bold text-warm-dark">
              Thank you for shopping with FreshTrack Grocery!
            </p>
            <div className="flex items-center justify-center gap-2 text-green font-extrabold text-xs uppercase tracking-widest pt-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>Verified Digital Receipt</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
