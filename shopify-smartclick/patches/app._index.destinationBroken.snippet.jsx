// Drop-in change for app/routes/app._index.jsx (Shopify QR example app).
// Shows a warning when a QR code cannot build a storefront redirect URL.

// Inside QRTableRow, after the productDeleted block:
{qrCode.destinationBroken ? (
  <s-text tone="critical">Destination unavailable — re-save this QR code</s-text>
) : qrCode.productDeleted ? (
  <s-text tone="critical">Product has been deleted</s-text>
) : (
  truncate(qrCode.productTitle)
)}

// Optional: disable scan preview link when broken
const scanDisabled = qrCode.destinationBroken;
// Use scanDisabled to omit href on any "Test scan" control you add in the UI.
