const PDF = require('pdfkit-construct');
const fs = require('fs-extra');
const path = require('path');

const generatePdf = async (res, products) => {
    const doc = new PDF({
        bufferPages: true,
    });

    const filename = `Factura${Date.now()}.pdf}`;

    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachments; filename=factura',
    })

    doc.on('data', (data) => stream.write(data));
    doc.on('end', () => stream.end());

    doc.setDocumentHeader({
        height: '20%'
    }, () => {
        doc.fontSize(15).text('FACTURA DE DUVI', {
            width: 420,
            align: 'center'
        });

        doc.fontSize(12);

        doc.text('NIT: 123213213', {
            width: 420,
            align: 'left'
        });

        doc.text('CLIENTE: 143242342', {
            width: 420,
            align: 'left'
        });

        doc.text('VENDEDOR: DUVI TIENDA', {
            width: 420,
            align: 'left'
        });
    })

    doc.addTable([
        {key: 'nro', label: 'Número', align: 'left'},
        {key: 'description', label: 'Descripción', align: 'left'},
        {key: 'price', label: 'Precio', align: 'left'},
        {key: 'units', label: 'Unidades', align: 'left'}
    ], products, {
        border: null,
        width: 'fill_body',
        striped: true,
        stripedColors: ["#f6f6f6", "#d6c4dd"],
        cellsPadding: 10,
        marginLeft: 45,
        marginRight: 45,
        headAlign: 'left'
    });

    doc.render();
    doc.end(); // Terminamos de trabajar con nuestro pdf
}

module.exports = generatePdf;