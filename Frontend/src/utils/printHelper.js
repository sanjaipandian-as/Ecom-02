// Code 39 character mapping for barcode generation
const code39Patterns = {
    '0': 'N N N W W N W N N',
    '1': 'W N N W N N N N W',
    '2': 'N N W W N N N N W',
    '3': 'W N W W N N N N N',
    '4': 'N N N W W N N N W',
    '5': 'W N N W W N N N N',
    '6': 'N N W W W N N N N',
    '7': 'N N N W N N W N W',
    '8': 'W N N W N N W N N',
    '9': 'N N W W N N W N N',
    'A': 'W N N N N W N N W',
    'B': 'N N W N N W N N W',
    'C': 'W N W N N W N N N',
    'D': 'N N N N W W N N W',
    'E': 'W N N N W W N N N',
    'F': 'N N W N W W N N N',
    'G': 'N N N N N W W N W',
    'H': 'W N N N N W W N N',
    'I': 'N N W N N W W N N',
    'J': 'N N N N W W W N N',
    'K': 'W N N N N N N W W',
    'L': 'N N W N N N N W W',
    'M': 'W N W N N N N W N',
    'N': 'N N N N W N N W W',
    'O': 'W N N N W N N W N',
    'P': 'N N W N W N N W N',
    'Q': 'N N N N N N W W W',
    'R': 'W N N N N N W W N',
    'S': 'N N W N N N W W N',
    'T': 'N N N N W N W W N',
    'U': 'W W N N N N N N W',
    'V': 'N W W N N N N N W',
    'W': 'W W W N N N N N N',
    'X': 'N W N N W N N N W',
    'Y': 'W W N N W N N N N',
    'Z': 'N W W N W N N N N',
    '-': 'N W N N N N W N W',
    '.': 'W W N N N N W N N',
    ' ': 'N W W N N N W N N',
    '*': 'N W N N W N W N N',
    '$': 'N W N W N W N N N',
    '/': 'N W N W N N N W N',
    '+': 'N W N N N W N W N',
    '%': 'N N N W N W N W N'
};

// Generates an SVG barcode using the Code 39 format
const generateBarcodeSVG = (text) => {
    if (!text) return '';
    
    // Strip special characters except alphanumeric, convert to uppercase and slice to readable size (e.g. 8 chars)
    const rawText = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(-8);
    const cleanText = `*${rawText}*`;
    
    const wWidth = 2.5; // Wide bar width
    const nWidth = 1.0; // Narrow bar width
    const gap = 1.0;   // Inter-character space
    const height = 45;  // Height of barcode lines
    
    let svgContent = '';
    let currentX = 0;
    
    for (let char of cleanText) {
        const pattern = code39Patterns[char] || code39Patterns['*'];
        const elements = pattern.split(' ');
        
        for (let i = 0; i < elements.length; i++) {
            const isBar = i % 2 === 0; // Even indices are bars (0, 2, 4, 6, 8)
            const isWide = elements[i] === 'W';
            const width = isWide ? wWidth : nWidth;
            
            if (isBar) {
                svgContent += `<rect x="${currentX}" y="0" width="${width}" height="${height}" fill="#1e293b" />`;
            }
            currentX += width;
        }
        currentX += gap;
    }
    
    return `
        <svg width="${currentX}" height="65" viewBox="0 0 ${currentX} 65" xmlns="http://www.w3.org/2000/svg">
            ${svgContent}
            <text x="${currentX / 2}" y="${height + 15}" font-family="monospace" font-size="10" font-weight="bold" fill="#64748b" text-anchor="middle">${rawText}</text>
        </svg>
    `;
};

// Formats helper functions for print HTML
const formatAddressHTML = (ship) => {
    if (!ship) return 'No address provided';
    if (typeof ship === 'string') return ship;
    
    const name = ship.fullname || ship.fullName || 'Valued Customer';
    const street = ship.street || ship.addressLine || '';
    const city = ship.city || '';
    const state = ship.state || '';
    const zip = ship.zipCode || ship.pincode || '';
    const country = ship.country || 'India';
    const mobile = ship.mobile || ship.phone || '';
    
    return `
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">${name}</div>
        <div>${street}</div>
        <div>${city}, ${state} - ${zip}</div>
        <div>${country}</div>
        ${mobile ? `<div style="margin-top: 6px; font-weight: 600; color: #4f46e5;">📞 Mobile: ${mobile}</div>` : ''}
    `;
};

const generateInvoiceHTML = (order) => {
    const orderId = order._id;
    const shortId = orderId.slice(-8).toUpperCase();
    const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const subtotal = order.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
    const shipping = 0; // Free shipping
    const total = order.totalAmount || subtotal;
    
    const itemsRows = order.items?.map((item, index) => {
        const title = item.productId?.name || 'Standard Product';
        const sku = (item.productId?._id || '').slice(-6).toUpperCase();
        return `
            <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td style="font-weight: 600; color: #0f172a;">
                    ${title}
                    <div style="font-size: 10px; color: #64748b; font-weight: normal; margin-top: 2px;">SKU: ${sku}</div>
                </td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">₹${item.price?.toLocaleString('en-IN')}</td>
                <td style="text-align: right; font-weight: 600; color: #0f172a;">₹${(item.price * item.quantity)?.toLocaleString('en-IN')}</td>
            </tr>
        `;
    }).join('') || '';

    const paymentLabel = order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online / Digital';
    const statusLabel = order.status?.replace('_', ' ').toUpperCase();
    const statusColor = order.status === 'delivered' ? '#10b981' : 
                        order.status === 'paid' || order.status === 'shipped' ? '#4f46e5' : '#f59e0b';
    
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Invoice - ${shortId}</title>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
                @page {
                    size: A4;
                    margin: 15mm 15mm 20mm 15mm;
                }
                body {
                    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
                    color: #334155;
                    line-height: 1.5;
                    font-size: 12px;
                    margin: 0;
                    padding: 0;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .container {
                    width: 100%;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 2px solid #e2e8f0;
                    padding-bottom: 20px;
                    margin-bottom: 25px;
                }
                .brand {
                    font-size: 24px;
                    font-weight: 800;
                    letter-spacing: -0.05em;
                    color: #0f172a;
                    margin: 0 0 5px 0;
                }
                .brand span {
                    color: #4f46e5;
                }
                .store-details {
                    font-size: 11px;
                    color: #64748b;
                    font-weight: 500;
                }
                .invoice-title {
                    text-align: right;
                }
                .invoice-title h1 {
                    font-size: 20px;
                    font-weight: 800;
                    margin: 0 0 8px 0;
                    color: #4f46e5;
                    letter-spacing: 0.05em;
                }
                .meta-badge {
                    display: inline-block;
                    padding: 3px 8px;
                    font-size: 9px;
                    font-weight: 700;
                    border-radius: 0px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    background-color: ${statusColor}15;
                    color: ${statusColor};
                    border: 1px solid ${statusColor}30;
                }
                .details-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin-bottom: 30px;
                }
                .details-card {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 15px;
                }
                .card-title {
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    color: #64748b;
                    letter-spacing: 0.1em;
                    margin-bottom: 8px;
                    border-bottom: 1px dashed #cbd5e1;
                    padding-bottom: 4px;
                }
                .meta-table {
                    width: 100%;
                    font-size: 11px;
                }
                .meta-table td {
                    padding: 3px 0;
                }
                .meta-table td:first-child {
                    font-weight: 700;
                    color: #64748b;
                    width: 100px;
                }
                .meta-table td:last-child {
                    color: #0f172a;
                    font-weight: 600;
                }
                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 25px;
                }
                .items-table th {
                    background: #0f172a;
                    color: #ffffff;
                    text-transform: uppercase;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    padding: 10px;
                    border: 1px solid #0f172a;
                }
                .items-table td {
                    padding: 12px 10px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .summary-container {
                    display: flex;
                    justify-content: flex-end;
                    margin-bottom: 40px;
                }
                .summary-box {
                    width: 280px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 15px;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 6px 0;
                    font-size: 11px;
                }
                .summary-row.total {
                    border-top: 2px solid #e2e8f0;
                    margin-top: 8px;
                    padding-top: 10px;
                    font-size: 14px;
                    font-weight: 800;
                    color: #4f46e5;
                }
                .footer {
                    border-top: 1px solid #e2e8f0;
                    padding-top: 15px;
                    text-align: center;
                    font-size: 10px;
                    color: #94a3b8;
                    margin-top: 50px;
                    font-weight: 500;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div>
                        <h1 class="brand">PLENORA<span>.</span></h1>
                        <div class="store-details">
                            <div>Plenora Scientific Skin</div>
                            <div>plenorascientificskin@gmail.com</div>
                            <div>+91-7448833345</div>
                        </div>
                    </div>
                    <div class="invoice-title">
                        <h1>TAX INVOICE</h1>
                        <div style="font-weight: 700; color: #0f172a; margin-bottom: 5px;">#${shortId}</div>
                        <div class="meta-badge">${statusLabel}</div>
                    </div>
                </div>

                <div class="details-grid">
                    <div class="details-card">
                        <div class="card-title">Order Ledger Info</div>
                        <table class="meta-table">
                            <tr>
                                <td>Order ID:</td>
                                <td>${orderId}</td>
                            </tr>
                            <tr>
                                <td>Order Date:</td>
                                <td>${date}</td>
                            </tr>
                            <tr>
                                <td>Payment:</td>
                                <td>${paymentLabel}</td>
                            </tr>
                            ${order.razorpayPaymentId ? `
                            <tr>
                                <td>Gateway TXN:</td>
                                <td style="font-family: monospace; font-size: 10px;">${order.razorpayPaymentId}</td>
                            </tr>
                            ` : ''}
                        </table>
                    </div>
                    <div class="details-card">
                        <div class="card-title">Shipping Address</div>
                        <div style="font-size: 11px; line-height: 1.5; color: #475569;">
                            ${formatAddressHTML(order.shippingAddress)}
                        </div>
                    </div>
                </div>

                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="width: 40px; text-align: center;">#</th>
                            <th style="text-align: left;">Item Description</th>
                            <th style="width: 60px; text-align: center;">Qty</th>
                            <th style="width: 100px; text-align: right;">Unit Price</th>
                            <th style="width: 110px; text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsRows}
                    </tbody>
                </table>

                <div class="summary-container">
                    <div class="summary-box">
                        <div class="summary-row">
                            <span style="color: #64748b; font-weight: 600;">Subtotal</span>
                            <span style="font-weight: 700; color: #0f172a;">₹${subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div class="summary-row">
                            <span style="color: #64748b; font-weight: 600;">Shipping</span>
                            <span style="font-weight: 700; color: #10b981;">Free</span>
                        </div>
                        <div class="summary-row total">
                            <span>Grand Total</span>
                            <span>₹${total.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <div style="font-weight: 700; color: #64748b; margin-bottom: 5px;">Thank you for shopping with PLENORA!</div>
                    <div>This is a computer-generated tax invoice. For returns or support, contact plenorascientificskin@gmail.com.</div>
                </div>
            </div>
        </body>
        </html>
    `;
};

const generatePackingSlipHTML = (order) => {
    const orderId = order._id;
    const shortId = orderId.slice(-8).toUpperCase();
    const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const barcodeSVG = generateBarcodeSVG(orderId);
    
    const itemsRows = order.items?.map((item, index) => {
        const title = item.productId?.name || 'Standard Product';
        const sku = (item.productId?._id || '').slice(-6).toUpperCase();
        return `
            <tr>
                <td style="text-align: center;"><div class="check-box"></div></td>
                <td style="text-align: center; font-weight: 600;">${index + 1}</td>
                <td style="font-weight: 700; color: #0f172a; font-size: 13px;">
                    ${title}
                    <div style="font-size: 10px; color: #64748b; font-weight: 600; margin-top: 2px;">SKU: ${sku}</div>
                </td>
                <td style="text-align: center; font-size: 16px; font-weight: 800; color: #0f172a;">${item.quantity}</td>
                <td style="text-align: center; color: #cbd5e1; font-weight: bold; font-size: 14px;">[ &nbsp; &nbsp; ]</td>
                <td style="font-weight: 600; font-size: 10px; text-transform: uppercase; color: #94a3b8; text-align: center;">Pending Check</td>
            </tr>
        `;
    }).join('') || '';

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Packing Slip - ${shortId}</title>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
                @page {
                    size: A4;
                    margin: 15mm;
                }
                body {
                    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
                    color: #1e293b;
                    line-height: 1.5;
                    font-size: 12px;
                    margin: 0;
                    padding: 0;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .container {
                    width: 100%;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .header-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    align-items: center;
                    border-bottom: 3px double #cbd5e1;
                    padding-bottom: 15px;
                    margin-bottom: 25px;
                }
                .brand {
                    font-size: 26px;
                    font-weight: 800;
                    letter-spacing: -0.05em;
                    color: #0f172a;
                    margin: 0 0 4px 0;
                }
                .brand span {
                    color: #4f46e5;
                }
                .slip-title {
                    font-size: 13px;
                    font-weight: 800;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #64748b;
                }
                .barcode-container {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    justify-content: center;
                }
                .logistics-card {
                    border-left: 5px solid #0f172a;
                    background: #f8fafc;
                    border-top: 1px solid #e2e8f0;
                    border-right: 1px solid #e2e8f0;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 20px;
                    margin-bottom: 30px;
                }
                .grid-2col {
                    display: grid;
                    grid-template-columns: 1fr 1.2fr;
                    gap: 25px;
                }
                .section-title {
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    color: #64748b;
                    letter-spacing: 0.1em;
                    margin-bottom: 10px;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 4px;
                }
                .meta-info-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    font-size: 11px;
                }
                .meta-info-list li {
                    margin-bottom: 6px;
                    display: flex;
                }
                .meta-info-list span.label {
                    font-weight: 700;
                    color: #64748b;
                    width: 90px;
                    flex-shrink: 0;
                }
                .meta-info-list span.val {
                    font-weight: 600;
                    color: #0f172a;
                }
                .shipping-address {
                    font-size: 12px;
                    line-height: 1.6;
                    color: #334155;
                }
                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 35px;
                }
                .items-table th {
                    background: #e2e8f0;
                    color: #1e293b;
                    text-transform: uppercase;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                    padding: 12px 10px;
                    border-bottom: 2px solid #cbd5e1;
                }
                .items-table td {
                    padding: 14px 10px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .check-box {
                    width: 16px;
                    height: 16px;
                    border: 2px solid #475569;
                    margin: 0 auto;
                }
                .packer-sign-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 50px;
                    margin-top: 50px;
                    border-top: 1px dashed #cbd5e1;
                    padding-top: 30px;
                }
                .sign-line {
                    border-top: 1.5px solid #94a3b8;
                    margin-top: 40px;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #64748b;
                    letter-spacing: 0.05em;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header-grid">
                    <div>
                        <h1 class="brand">PLENORA<span>.</span></h1>
                        <div class="slip-title">Warehouse Packing Slip</div>
                    </div>
                    <div class="barcode-container">
                        ${barcodeSVG}
                    </div>
                </div>

                <div class="logistics-card">
                    <div class="grid-2col">
                        <div>
                            <div class="section-title">Logistics Ledger</div>
                            <ul class="meta-info-list">
                                <li>
                                    <span class="label">Order Ref:</span>
                                    <span class="val">#${shortId}</span>
                                </li>
                                <li>
                                    <span class="label">Order Date:</span>
                                    <span class="val">${date}</span>
                                </li>
                                <li>
                                    <span class="label">Ship Class:</span>
                                    <span class="val">Standard Surface</span>
                                </li>
                                <li>
                                    <span class="label">Fulfillment:</span>
                                    <span class="val" style="color: #4f46e5;">Logistics Queue</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <div class="section-title">Deliver To</div>
                            <div class="shipping-address">
                                ${formatAddressHTML(order.shippingAddress)}
                            </div>
                        </div>
                    </div>
                </div>

                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="width: 45px; text-align: center;">Picked</th>
                            <th style="width: 40px; text-align: center;">#</th>
                            <th style="text-align: left;">Product Details / SKU</th>
                            <th style="width: 75px; text-align: center;">Qty Ordered</th>
                            <th style="width: 75px; text-align: center;">Qty Picked</th>
                            <th style="width: 100px; text-align: center;">Verification</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsRows}
                    </tbody>
                </table>

                <div class="packer-sign-grid">
                    <div>
                        <div class="sign-line">Packer's Identity & Initials</div>
                        <div style="font-size: 9px; color: #94a3b8; margin-top: 4px; font-weight: 500;">Write name and initial after visual confirmation.</div>
                    </div>
                    <div>
                        <div class="sign-line">Logistics Auditor Signature</div>
                        <div style="font-size: 9px; color: #94a3b8; margin-top: 4px; font-weight: 500;">Verify barcodes match courier waybills.</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};

/**
 * Triggers the printing of either the invoice or packing slip for an order.
 * Creates a hidden iframe, writes custom styled print HTML, calls window.print(), and cleans up.
 * 
 * @param {Object} order - The order object data
 * @param {string} type - 'invoice' or 'packing_slip'
 */
export const printOrder = (order, type) => {
    if (!order) return;

    // Create a unique hidden iframe
    const iframeId = `print-frame-${order._id}-${type}`;
    let iframe = document.getElementById(iframeId);
    if (iframe) {
        document.body.removeChild(iframe);
    }

    iframe = document.createElement('iframe');
    iframe.id = iframeId;
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.zIndex = '-9999';
    document.body.appendChild(iframe);

    // Generate content
    const htmlContent = type === 'invoice'
        ? generateInvoiceHTML(order)
        : generatePackingSlipHTML(order);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Focus and trigger print
    iframe.contentWindow.focus();
    
    // Tiny delay to ensure browser parses resources/layout completely
    setTimeout(() => {
        iframe.contentWindow.print();
        // Give the print dialog time to close before destroying frame
        setTimeout(() => {
            if (iframe && iframe.parentNode) {
                document.body.removeChild(iframe);
            }
        }, 3000);
    }, 250);
};
