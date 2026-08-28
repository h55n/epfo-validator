/**
 * useFocusTrap — traps keyboard focus inside a container element.
 *
 * When active, Tab and Shift+Tab cycle only within focusable children.
 * Escape calls onClose if provided.
 * On deactivation, focus is returned to the element that was focused
 * before the trap was activated (e.g. the button that opened a modal).
 *
 * Usage:
 *   const ref = useFocusTrap(isOpen, onClose)
 *   return <div ref={ref} role="dialog" ...>...</div>
 */

import { useRef, useEffect } from 'react'

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'details > summary',
].join(', ')

/**
 * @param {boolean}       active   Whether the trap is engaged
 * @param {Function}      [onClose] Called when Escape is pressed
 * @returns {React.RefObject}       Attach to the container element
 */
export function useFocusTrap(active, onClose) {
  const containerRef     = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (!active) return

    // Store whatever had focus before the trap engaged
    previousFocusRef.current = document.activeElement

    // Focus the first focusable child
    const container = containerRef.current
    if (!container) return
    const focusable = Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS))
    if (focusable.length > 0) {
      focusable[0].focus()
    } else {
      // Fallback: focus the container itself
      container.setAttribute('tabindex', '-1')
      container.focus()
    }

    function handleKeyDown(e) {
      if (!containerRef.current) return

      if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
        return
      }

      if (e.key !== 'Tab') return

      const focusableEls = Array.from(
        containerRef.current.querySelectorAll(FOCUSABLE_SELECTORS)
      ).filter(el => !el.closest('[inert]'))

      if (focusableEls.length === 0) { e.preventDefault(); return }

      const first = focusableEls[0]
      const last  = focusableEls[focusableEls.length - 1]

      if (e.shiftKey) {
        // Shift+Tab — if at first, wrap to last
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        // Tab — if at last, wrap to first
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // Return focus to the trigger element
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus()
      }
    }
  }, [active, onClose])

  return containerRef
}
