import { X } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

let scrollLocks = 0;
let savedOverflow = '';
let savedPadding = '';

export default function DetailSheet({
  open,
  mobileOnly = false,
  label,
  caption,
  closeLabel,
  onClose,
  children,
}: {
  open: boolean;
  mobileOnly?: boolean;
  label: string;
  caption: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [mobile, setMobile] = useState(
    () => window.matchMedia('(max-width: 1023px)').matches,
  );
  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const update = () => setMobile(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const visible = open && (!mobileOnly || mobile);
  useEffect(() => {
    if (!visible) return;
    const dialog = ref.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    if (scrollLocks === 0) {
      savedOverflow = document.body.style.overflow;
      savedPadding = document.body.style.paddingRight;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0)
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';
    }
    scrollLocks += 1;
    dialog.showModal();
    return () => {
      dialog.close();
      scrollLocks -= 1;
      if (scrollLocks === 0) {
        document.body.style.overflow = savedOverflow;
        document.body.style.paddingRight = savedPadding;
      }
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [visible]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={`national-detail-sheet ${mobileOnly ? 'national-district-sheet' : 'national-project-sheet'}`}
    >
      <div className="national-sheet-header sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-5 py-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary-700">
          {caption}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <X size={20} />
        </button>
      </div>
      <div className="national-sheet-content">{children}</div>
    </dialog>
  );
}
