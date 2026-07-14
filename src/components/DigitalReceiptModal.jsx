import { useState, useRef, useEffect } from 'react'
import { toPng } from 'html-to-image'
import { Download, ArrowLeft, ShoppingCart, CheckCircle2, Loader2 } from 'lucide-react'

export default function DigitalReceiptModal({ isOpen, onClose, checkedItems = [], totalPrice = 0 }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [receiptNumber] = useState(() => Math.floor(100000 + Math.random() * 900000))
  const receiptRef = useRef(null)

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

  async function handleDownloadImage() {
    if (!receiptRef.current) return
    setIsGenerating(true)
    try {
      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#FFFFFF',
      })
      const now = new Date()
      const datePart = now.toISOString().slice(0, 10)
      const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '')
      const link = document.createElement('a')
      link.download = `FreshTrack_Receipt_${datePart}_${timePart}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Failed to generate digital receipt image:', error)
      alert('Could not generate image right now. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cream overflow-y-auto min-h-svh animate-fadeIn">
      {/* Top Sticky Navigation Bar of Pager */}
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 bg-cream/95 px-6 py-4 backdrop-blur-md shadow-2xs">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 rounded-xl bg-surface border border-border/80 px-4 py-2.5 text-xs sm:text-sm font-bold text-warm-dark hover:bg-cream-dark active:scale-95 transition-all shadow-none"
        >
          <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
          <span>Back to Grocery List</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isGenerating || checkedItems.length === 0}
            className="flex items-center gap-2 rounded-xl bg-green px-5 py-2.5 text-xs sm:text-sm font-black text-white hover:bg-green-light active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-none"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating Image...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4 stroke-[2.5]" />
                <span>Download as Image (PNG)</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Whole Screen Pager Receipt Content Area - No Outer Border or Container */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col items-center justify-start">
        <div
          ref={receiptRef}
          className="w-full bg-white p-8 sm:p-14 text-warm-dark font-mono shadow-none border-none"
        >
          {/* Top Store Header */}
          <div className="text-center pb-6 border-b-2 border-dashed border-border/80">
            <div className="flex items-center justify-center gap-2.5 text-green font-black text-2xl sm:text-3xl tracking-tight font-sans">
              <ShoppingCart className="h-7 w-7 stroke-[2.5]" />
              <span>FreshTrack Grocery</span>
            </div>
            <p className="text-xs sm:text-sm text-warm-gray mt-1.5 font-sans font-bold uppercase tracking-wider">
              Official Digital Receipt • Philippines
            </p>
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
