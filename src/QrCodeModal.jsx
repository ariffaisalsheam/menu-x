import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import styles from './QrCodeManager.module.css'; // Reusing styles from QrCodeManager

const QrCodeModal = ({ isOpen, onClose, tableUrl, tableName, qrCodeRef }) => {
  if (!isOpen) return null;

  const downloadQrCode = () => {
    if (qrCodeRef.current) {
      const canvas = qrCodeRef.current.querySelector('canvas');
      if (canvas) {
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `qr-code-${tableName.replace(/\s/g, '-')}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>QR Code for {tableName}</h2>
        <div className={styles.qrCodeContainer} ref={qrCodeRef}>
          <QRCodeCanvas value={tableUrl} size={256} level="H" />
        </div>
        <button onClick={downloadQrCode} className={styles.downloadButton}>Download PNG</button>
        <button onClick={onClose} className={styles.closeButton}>Close</button>
      </div>
    </div>
  );
};

export default QrCodeModal;
