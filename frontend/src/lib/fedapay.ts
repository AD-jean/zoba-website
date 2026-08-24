const SCRIPT_URL = 'https://cdn.fedapay.com/checkout.js?v=1.1.7';

export interface FedaPayTransactionResult {
  id: number;
  status: string;
}

export interface FedaPayInitOptions {
  public_key: string;
  transaction: { id: number };
  customer?: {
    email?: string;
    firstname?: string;
    lastname?: string;
  };
  onComplete: (reason: string, transaction: FedaPayTransactionResult) => void;
}

export interface FedaPayGlobal {
  init: (selector: string, options: FedaPayInitOptions) => void;
  CHECKOUT_COMPLETED: string;
  DIALOG_DISMISSED: string;
}

declare global {
  interface Window {
    FedaPay?: FedaPayGlobal;
  }
}

let loadPromise: Promise<FedaPayGlobal> | null = null;

export function loadFedaPayScript(): Promise<FedaPayGlobal> {
  if (window.FedaPay) return Promise.resolve(window.FedaPay);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      if (window.FedaPay) resolve(window.FedaPay);
      else reject(new Error('FedaPay Checkout.js charge mais indisponible'));
    };
    script.onerror = () => reject(new Error('Impossible de charger FedaPay Checkout.js'));
    document.body.appendChild(script);
  });

  return loadPromise;
}
