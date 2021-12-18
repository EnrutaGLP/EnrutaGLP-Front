import { Workbook } from 'exceljs';
import * as fs from 'file-saver';

function reporteHojaDeRuta(worksheet, header, data){
    worksheet.addRow(["Hoja de rutas"]);
    worksheet.addRow();
    worksheet.addRow(["Código del camión","Hora de salida","Hora de llegada","Consumo de petróleo","Tipo de ruta","Código del pedido",
        "Cantidad de GLP entregada","Cantidad de GLP del pedido","Fecha y hora límite de entrega","Nombre de planta",
        "Cantidad de GLP recargada","Puntos"]);
    worksheet.columns[0].width=25;
    worksheet.columns[1].width=30;
    worksheet.columns[2].width=30;
    worksheet.columns[3].width=25;
    worksheet.columns[4].width=25;
    worksheet.columns[5].width=25;
    worksheet.columns[6].width=25;
    worksheet.columns[7].width=25;
    worksheet.columns[8].width=30;
    worksheet.columns[9].width=25;
    worksheet.columns[10].width=25;
    let fila=[];
    let maxCantidadPuntos=1;
    for(let i=0;i<data.length;i++){
        if(maxCantidadPuntos<data[i].puntos.length){
            maxCantidadPuntos=data[i].puntos.length;
        }
        if(data[i].tipo==1){
            fila=[data[i].codigoCamion,data[i].horaSalida,data[i].horaLlegada,data[i].consumoPetroleo,"Ruta hacia cliente",
                data[i].codigoPedido,data[i].cantidadEntregada+"m³",data[i].cantidadGlp+"m³",data[i].fechaLimite,"-","-"];
        }else{
            fila=[data[i].codigoCamion,data[i].horaSalida,data[i].horaLlegada,data[i].consumoPetroleo,"Ruta hacia planta",
                "-","-","-","-",data[i].nombrePlanta,data[i].cantidadRecargada+"m³"];
        }
        for(let j=0;j<data[i].puntos.length;j++){
            fila.push("("+data[i].puntos[j].ubicacionX+","+data[i].puntos[j].ubicacionY+")");
        }
        worksheet.addRow(fila);
    }
    console.log(maxCantidadPuntos);
    worksheet.mergeCells(3,12,3,12+maxCantidadPuntos-1);
    var borderStyles={
        top:{style:"medium"},
        left:{style:"medium"},
        bottom:{style:"medium"},
        right:{style:"medium"},
    }

    var alignment={
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
    }
    worksheet.eachRow((element)=>{
        element.eachCell((elem)=>{
            elem.border = borderStyles;
            elem.alignment = alignment;
            elem.font={
                name: 'Calibri',
                family: 4,
                size: 10,
                underline: false,
            }
        })
    });
    return worksheet;
}

export function DExcel(title = "Reporte", workSheetName = "Datos", header, data) {
    // Crea un nuevo libro
    let workbook = new Workbook();

    // Crea una nueva hoja
    let worksheet = workbook.addWorksheet(workSheetName);

    worksheet = reporteHojaDeRuta(worksheet, header, data);
    //Descargar el archivo
    workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
        fs.saveAs(blob, title + '.xlsx');
    });
}