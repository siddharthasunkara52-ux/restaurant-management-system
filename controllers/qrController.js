import QRCode from 'qrcode';
import Table from '../models/Table.js';

const qrController = {
  generateQR: async (req, res, next) => {
    try {
      const { tableId } = req.params;
      const table = await Table.findById(tableId);

      if (!table) {
        return res.status(404).json({ success: false, error: 'Table not found' });
      }

      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const url = `${baseUrl}/r/${table.restaurant_id}/table/${table.id}`;

      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      res.json({
        success: true,
        qrCode: qrDataUrl,
        url,
        tableNumber: table.table_number,
      });
    } catch (err) {
      next(err);
    }
  },

  downloadQR: async (req, res, next) => {
    try {
      const { tableId } = req.params;
      const table = await Table.findById(tableId);

      if (!table) {
        return res.status(404).json({ success: false, error: 'Table not found' });
      }

      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const url = `${baseUrl}/r/${table.restaurant_id}/table/${table.id}`;

      const qrBuffer = await QRCode.toBuffer(url, {
        width: 600,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename=table-${table.table_number}-qr.png`);
      res.send(qrBuffer);
    } catch (err) {
      next(err);
    }
  },
};

export default qrController;
