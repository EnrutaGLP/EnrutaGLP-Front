import { Workbook } from 'exceljs';
import * as fs from 'file-saver';

function reporteHistorico(worksheet, header, data){
    console.log(worksheet)
    // Agregar cabecera
    worksheet.addRow([null, "Reporte Historico de Resultados de Estudiante"]);
    worksheet.addRow([null, "Facultad", header.facultad]);
    worksheet.addRow([null, "Especialidad:", header.especialidad]);
    worksheet.addRow();
    worksheet.addRow();
    //iterar cada resultado estudiante
    let resultados = Object.keys(data);
    resultados.forEach(function (item, index){
        let indicadores_json = data[item]
        if(JSON.stringify(indicadores_json)!==JSON.stringify({})){
            //iterar cada indicador
            let indicadores = Object.keys(indicadores_json)
            indicadores.forEach(function(item, index){
                //iterar cada semestre
                let semestres_json = indicadores_json[item];
                if(JSON.stringify(semestres_json)!==JSON.stringify({})){
                    let semestres = Object.keys(semestres_json)
                    semestres.forEach(function(item, index){
                        let porcentajeLogro = semestres_json[item].porcentajeLogro
                        
                    });
                }

            });
        }
    });

    // /*
    // for(let i = 0; i < 5; i++)
    //     worksheet.mergeCells(10 + i, 1, 10 + i, 3);
    // worksheet.getCell("C10").value = "DESCRIPCIÓN";
    // */
    // worksheet.addRow()
    // // worksheet.mergeCells('B1:D1');
    // /*
    // worksheet.getCell("D1").border = {
    //     top: {style:'thin'},
    //     left: {style:'thin'},
    //     bottom: {style:'thin'},
    //     right: {style:'thin'},
    // };
    // */


    // // Agregar columnas
    // let columns = [null, "Resultados del Estudiante"];
    // if(header.indicadores)
    //     columns.push("Indicadores");
    // for(let i of data)
    //     columns.push(i.semestre);
    // console.log(data);
    // worksheet.addRow(columns);

    // // Agregar filas
    // for(let x of data){
    //     for(let y of x.resultadosEstudiante){
    //         for(let z of y.indicadoresDespemeno){
    //             worksheet.addRow([null, y.RE, z.ID, z.porcentajeLogro]);
    //         }
            
    //     }
    // }

    // let maxL = 0;
    // let currentColumn = 2;
    // for(let i = 2; i < worksheet.rowCount; i++)
    //     if(worksheet.getCell(i,currentColumn).value && worksheet.getCell(i,currentColumn).value.length > maxL)
    //         maxL = worksheet.getCell(i,currentColumn).value.length;

    // worksheet.getColumn(currentColumn).width = maxL;
    
    return worksheet
}

function reporteResultadosEstudiante(worksheet, header, data){
    console.log("entra");
    console.log(header.idDes);
    console.log(worksheet);
    worksheet.addRow([null, "Reporte de Resultados de Estudiante"]);
    worksheet.mergeCells(0,2,0,3);
    worksheet.getCell(1,2).fill={
        type:'pattern',
        pattern:'solid',
        fgColor:{argb:'66E0C3'},
    };
    worksheet.addRow();
    worksheet.addRow([null, "Especialidad: ",header.nombreEspecialidad]);
    worksheet.getCell(3,2).font={ name:'Calibri', size:11, bold:true };
    worksheet.getCell(3,2).alignment={ horizontal:'left' };

    console.log(worksheet._rows[0]);
    console.log(worksheet.columns[1]);

    worksheet.addRow();
    worksheet.addRow();
    worksheet.addRow();

    var borderStyles={
        top:{style:"thin"},
        left:{style:"thin"},
        bottom:{style:"thin"},
        right:{style:"thin"},
    }
    worksheet._rows[0].font={
        name: 'Calibri',
        family: 4,
        size: 16,
        underline: true,
        bold: true
    }
    
    if(header.idDes===1){//esto va a doler xd
        worksheet.addRow([null, "Codigo resultado", "Indicadores", "Curso", "Muestras", "Porcentaje Logro(%)"]);

        worksheet.getCell(7,2).fill={ type:'pattern', pattern:'solid', fgColor:{argb:'66E0C3'} };
        worksheet.getCell(7,3).fill={ type:'pattern', pattern:'solid', fgColor:{argb:'66E0C3'} };
        worksheet.getCell(7,4).fill={ type:'pattern', pattern:'solid', fgColor:{argb:'66E0C3'} };
        worksheet.getCell(7,5).fill={ type:'pattern', pattern:'solid', fgColor:{argb:'66E0C3'} };
        worksheet.getCell(7,6).fill={ type:'pattern', pattern:'solid', fgColor:{argb:'66E0C3'} };
        worksheet.getCell(7,2).font={ name:'Calibri', size:11, bold:true };
        worksheet.getCell(7,3).font={ name:'Calibri', size:11, bold:true };
        worksheet.getCell(7,4).font={ name:'Calibri', size:11, bold:true };
        worksheet.getCell(7,5).font={ name:'Calibri', size:11, bold:true };
        worksheet.getCell(7,6).font={ name:'Calibri', size:11, bold:true };
        worksheet.getCell(7,2).alignment={ horizontal:'center' };
        worksheet.getCell(7,3).alignment={ horizontal:'center' };
        worksheet.getCell(7,4).alignment={ horizontal:'center' };
        worksheet.getCell(7,5).alignment={ horizontal:'center' };
        worksheet.getCell(7,6).alignment={ horizontal:'center' };
        
        worksheet.columns[1].alignment={wrapText:true};
        worksheet.columns[2].alignment={wrapText:true};
        worksheet.columns[3].alignment={wrapText:true};
        worksheet.columns[4].alignment={wrapText:true};
        worksheet.columns[5].alignment={wrapText:true};

        console.log(data);

        let lineasPorRE=0;
        let auxNumLineasRE=0;
        let lineasPorID=0;
        let auxNumLineasID=0;
        let lineasPorCurso=0;
        let auxNumLineasCurso=0;
        try{
            data.data.data.forEach(element => {
                if(element.indicadores.length>0){
                    if(element.indicadores[0].cursos.length>0){
                        if(element.indicadores[0].cursos[0].muestras.length>0){
                            worksheet.addRow([null, element.RE, element.indicadores[0].ID, element.indicadores[0].cursos[0].curso,
                            element.indicadores[0].cursos[0].muestras[0].horario,element.indicadores[0].cursos[0].muestras[0].porcentajeLogro]);
                            lineasPorRE++;
                            lineasPorID++;
                            lineasPorCurso++;
                            for(let p=1;p<element.indicadores[0].cursos[0].muestras.length;p++){
                                worksheet.addRow([null, null, null, null, element.indicadores[0].cursos[0].muestras[p].horario,
                                element.indicadores[0].cursos[0].muestras[p].porcentajeLogro]);
                                lineasPorRE++;
                                lineasPorID++;
                                lineasPorCurso++;
                            }
                            //worksheet.mergeCells(8+auxNumLineasRE,4,8+lineasPorCurso+auxNumLineasRE-1,4);
                        }else{
                            worksheet.addRow([null, element.RE, element.indicadores[0].ID, element.indicadores[0].cursos[0].curso,
                            "Sin muestras registradas", null]);
                            lineasPorRE++;
                            worksheet.mergeCells(8+auxNumLineasRE+lineasPorRE-1,5,8+auxNumLineasRE+lineasPorRE-1,6);
                            lineasPorID++;
                            lineasPorCurso++;
                        }
                        for(let q=1;q<element.indicadores[0].cursos.length;q++){
                            if(element.indicadores[0].cursos[q].muestras.length>0){
                                worksheet.addRow([null, null, null,element.indicadores[0].cursos[q].curso,
                                element.indicadores[0].cursos[q].muestras[0].horario,element.indicadores[0].cursos[q].muestras[0].porcentajeLogro]);
                                lineasPorRE++;
                                lineasPorID++;
                                lineasPorCurso++;
                                for(let r=1;r<element.indicadores[0].cursos[q].muestras.length;r++){
                                    worksheet.addRow([null, null, null,element.indicadores[0].cursos[q].curso,
                                    element.indicadores[0].cursos[q].muestras[r].horario,element.indicadores[0].cursos[q].muestras[r].porcentajeLogro]);
                                    lineasPorRE++;
                                    lineasPorID++;
                                    lineasPorCurso++;
                                }
                                //worksheet.mergeCells(8+auxNumLineasRE,4,8+lineasPorCurso+auxNumLineasRE-1,4);
                            }else{
                                worksheet.addRow([null, null, null, element.indicadores[0].cursos[q].curso,
                                "Sin muestras registradas", null]);
                                lineasPorRE++;
                                worksheet.mergeCells(8+auxNumLineasRE+lineasPorRE-1,5,8+auxNumLineasRE+lineasPorRE-1,6);
                                lineasPorID++;
                                lineasPorCurso++;
                            }
                        }
                        worksheet.mergeCells(8+auxNumLineasRE,3,8+lineasPorID+auxNumLineasRE-1,3);
                    }else{
                        worksheet.addRow([null, element.RE, element.indicadores[0].ID, "Sin cursos registrados"]);
                        lineasPorRE++;
                        worksheet.mergeCells(8+auxNumLineasRE+lineasPorRE-1,4,8+auxNumLineasRE+lineasPorRE-1,6);
                        lineasPorID++;
                    }
                }else{
                    worksheet.addRow([null, element.RE, "Sin indicadores registrados", null, null]);
                    lineasPorRE++;
                    worksheet.mergeCells(8+auxNumLineasRE+lineasPorRE-1,3,8+auxNumLineasRE+lineasPorRE-1,6);
                }
               
                auxNumLineasID=auxNumLineasRE+lineasPorRE;
                auxNumLineasCurso=auxNumLineasRE+lineasPorRE;
                lineasPorID=0;
                lineasPorCurso=0;

                 /*------------*/
                for(let j=1;j<element.indicadores.length;j++){
                    if(element.indicadores[j].cursos.length>0){
                        if(element.indicadores[j].cursos[0].muestras.length>0){
                            worksheet.addRow([null, null, element.indicadores[j].ID, element.indicadores[j].cursos[0].curso,
                            element.indicadores[j].cursos[0].muestras[0].horario,element.indicadores[j].cursos[0].muestras[0].porcentajeLogro]);
                            lineasPorRE++;
                            lineasPorID++;
                            lineasPorCurso++;
                            for(let k=1;k<element.indicadores[j].cursos[0].muestras.length;k++){
                                worksheet.addRow([null, null, element.indicadores[j].ID, element.indicadores[j].cursos[0].curso,
                                element.indicadores[j].cursos[0].muestras[k].horario,element.indicadores[j].cursos[0].muestras[k].porcentajeLogro]);
                                lineasPorRE++;
                                lineasPorID++;
                                lineasPorCurso++;
                            }
                        }else{
                            worksheet.addRow([null, null, element.indicadores[j].ID, element.indicadores[j].cursos[0].curso,
                            "Sin muestras registradas", null]);
                            lineasPorRE++;
                            worksheet.mergeCells(8+auxNumLineasRE+lineasPorRE-1,5,8+auxNumLineasRE+lineasPorRE-1,6);
                            lineasPorID++;
                            lineasPorCurso++;
                        }
                        for(let a=1;a<element.indicadores[j].cursos.length;a++){
                            if(element.indicadores[j].cursos[a].muestras.length>0){
                                worksheet.addRow([null, null, null, element.indicadores[j].cursos[a].curso,
                                element.indicadores[j].cursos[a].muestras[0].horario,element.indicadores[j].cursos[a].muestras[0].porcentajeLogro]);
                                lineasPorRE++;
                                lineasPorID++;
                                lineasPorCurso++;
                                for(let b=1;b<element.indicadores[j].cursos[a].muestras.length;b++){
                                    worksheet.addRow([null, null, null, element.indicadores[j].cursos[a].curso,
                                    element.indicadores[j].cursos[a].muestras[b].horario,element.indicadores[j].cursos[a].muestras[b].porcentajeLogro]);
                                    lineasPorRE++;
                                    lineasPorID++;
                                    lineasPorCurso++;
                                }
                            }else{
                                worksheet.addRow([null, null, null, element.indicadores[j].cursos[a].curso,"Sin muestras registradas"]);
                                lineasPorRE++;
                                worksheet.mergeCells(8+auxNumLineasRE+lineasPorRE-1,5,8+auxNumLineasRE+lineasPorRE-1,6);
                                lineasPorID++;
                                lineasPorCurso++;
                            }
                        }
                    }else{
                        worksheet.addRow([null, null, element.indicadores[j].ID, "Sin cursos registrados"]);
                        lineasPorRE++;
                        worksheet.mergeCells(8+auxNumLineasRE+lineasPorRE-1,4,8+auxNumLineasRE+lineasPorRE-1,6);
                        lineasPorID++;
                    }
                    worksheet.mergeCells(8+auxNumLineasID,3,8+lineasPorID+auxNumLineasID-1,3);
                    auxNumLineasID=auxNumLineasID+lineasPorID;
                    auxNumLineasCurso=auxNumLineasID;
                    lineasPorID=0;
                    lineasPorCurso=0;
                }
                worksheet.mergeCells(8+auxNumLineasRE,2,8+lineasPorRE+auxNumLineasRE-1,2);
                auxNumLineasRE=auxNumLineasRE+lineasPorRE;
                auxNumLineasID=auxNumLineasRE;
                auxNumLineasCurso=auxNumLineasRE;
                lineasPorRE=0;
                lineasPorCurso=0;
            });
            /*------------*/

        }catch(err){
            console.log(err);
        }
        worksheet.columns[1].width=20;
        worksheet.columns[2].width=50;
        worksheet.columns[3].width=50;
        worksheet.columns[4].width=20;
        worksheet.columns[5].width=20;
        worksheet.columns[2].alignment={wrapText:true};
        worksheet.columns[5].numFmt="0.00";
    }else if(header.idDes===2){
        console.log(data);
        worksheet.addRow([null, "Codigo resultado", "Indicadores", "Curso", "Porcentaje Logro(%)"]);   

        worksheet.getCell(7,2).fill={ type:'pattern', pattern:'solid', fgColor:{argb:'66E0C3'} };
        worksheet.getCell(7,3).fill={ type:'pattern', pattern:'solid', fgColor:{argb:'66E0C3'} };
        worksheet.getCell(7,4).fill={ type:'pattern', pattern:'solid', fgColor:{argb:'66E0C3'} };
        worksheet.getCell(7,5).fill={ type:'pattern', pattern:'solid', fgColor:{argb:'66E0C3'} };
        worksheet.getCell(7,2).font={ name:'Calibri', size:11, bold:true };
        worksheet.getCell(7,3).font={ name:'Calibri', size:11, bold:true };
        worksheet.getCell(7,4).font={ name:'Calibri', size:11, bold:true };
        worksheet.getCell(7,5).font={ name:'Calibri', size:11, bold:true };
        worksheet.getCell(7,2).alignment={ horizontal:'center' };
        worksheet.getCell(7,3).alignment={ horizontal:'center' };
        worksheet.getCell(7,4).alignment={ horizontal:'center' };
        worksheet.getCell(7,5).alignment={ horizontal:'center' };
        
        worksheet.columns[1].alignment={wrapText:true};
        worksheet.columns[2].alignment={wrapText:true};
        worksheet.columns[3].alignment={wrapText:true};
        worksheet.columns[4].alignment={wrapText:true};

        let lineasPorRE=0;
        let auxNumLineasRE=0;
        let lineasPorID=0;
        let auxNumLineasID=0;

        try{
            data.data.data.forEach(element => {
                if(element.indicadores.length>0){
                    if(element.indicadores[0].cursos.length>0){
                        worksheet.addRow([null, element.RE, element.indicadores[0].ID, element.indicadores[0].cursos[0].curso,
                            element.indicadores[0].cursos[0].porcentajeLogro]);
                        lineasPorRE++;
                        lineasPorID++;
                        for(let i=1;i<element.indicadores[0].cursos.length;i++){
                            worksheet.addRow([null, null, null,element.indicadores[0].cursos[i].curso,element.indicadores[0].cursos[i].porcentajeLogro]);
                            lineasPorID++;
                            lineasPorRE++;
                        }
                        worksheet.mergeCells(8+auxNumLineasRE,3,8+lineasPorID+auxNumLineasRE-1,3);
                    }else{
                        worksheet.addRow([null, element.RE, element.indicadores[0].ID, "Sin cursos registrados", null]);
                        lineasPorRE++;
                        worksheet.mergeCells(8+lineasPorRE+auxNumLineasRE-1,4,8+lineasPorRE+auxNumLineasRE-1,5);
                    }
                }else{
                    worksheet.addRow([null, element.RE, "Sin indicadores registrados", null, null]);
                    lineasPorRE++;
                    worksheet.mergeCells(8+auxNumLineasRE+lineasPorRE-1,3,8+auxNumLineasRE+lineasPorRE-1,5);
                }
                auxNumLineasID=auxNumLineasRE+lineasPorRE;
                lineasPorID=0;
                for(let j=1;j<element.indicadores.length;j++){//for de los ID
                    if(element.indicadores[j].cursos.length>0){
                        worksheet.addRow([null, null, element.indicadores[j].ID, element.indicadores[j].cursos[0].curso,
                        element.indicadores[j].cursos[0].porcentajeLogro]);
                        lineasPorRE++;
                        lineasPorID++;
                        for(let k=1;k<element.indicadores[j].cursos.length;k++){
                            worksheet.addRow([null,null,null,element.indicadores[j].cursos[k].curso, element.indicadores[j].cursos[k].porcentajeLogro]);
                            lineasPorRE++;
                            lineasPorID++;
                        }
                    }else{
                        worksheet.addRow([null, null, element.indicadores[j].ID, "Sin cursos registrados"]);
                        lineasPorRE++;
                        worksheet.mergeCells(8+auxNumLineasRE+lineasPorRE-1,4,8+auxNumLineasRE+lineasPorRE-1,5);
                        lineasPorID++;
                    }
                    worksheet.mergeCells(8+auxNumLineasID,3,8+lineasPorID+auxNumLineasID-1,3);
                    auxNumLineasID=auxNumLineasID+lineasPorID;
                    lineasPorID=0;
                }
                worksheet.mergeCells(8+auxNumLineasRE,2,8+lineasPorRE+auxNumLineasRE-1,2);
                auxNumLineasRE=auxNumLineasRE+lineasPorRE;
                lineasPorRE=0;
                auxNumLineasID=auxNumLineasRE;
                lineasPorID=0;
            });
        }catch(err){
            console.log(err);
        }
        worksheet.columns[1].width=20;
        worksheet.columns[2].width=50;
        worksheet.columns[3].width=50;
        worksheet.columns[4].width=20;
        worksheet.columns[2].alignment={wrapText:true};
        worksheet.columns[4].numFmt="0.00";
    }else if(header.idDes===3){
        console.log(data);
        worksheet.addRow([null, "Codigo resultado", "Indicadores", "Porcentaje Logro(%)"]);

        worksheet.getCell(7,2).fill={ type:'pattern', pattern:'solid', fgColor:{argb:'66E0C3'} };
        worksheet.getCell(7,3).fill={ type:'pattern', pattern:'solid', fgColor:{argb:'66E0C3'} };
        worksheet.getCell(7,4).fill={ type:'pattern', pattern:'solid', fgColor:{argb:'66E0C3'} };
        worksheet.getCell(7,2).font={ name:'Calibri', size:11, bold:true };
        worksheet.getCell(7,3).font={ name:'Calibri', size:11, bold:true };
        worksheet.getCell(7,4).font={ name:'Calibri', size:11, bold:true };
        worksheet.getCell(7,2).alignment={ horizontal:'center' };
        worksheet.getCell(7,3).alignment={ horizontal:'center' };
        worksheet.getCell(7,4).alignment={ horizontal:'center' };

        worksheet.columns[1].alignment={wrapText:true};
        worksheet.columns[2].alignment={wrapText:true};
        worksheet.columns[3].alignment={wrapText:true};

        let lineasPorRE=0;
        let auxNumLineas=0;
        data.data.data.forEach(element => {
            if(element.indicadores.length>0){
                worksheet.addRow([null, element.RE, element.indicadores[0].ID, element.indicadores[0].porcentajeLogro]);
                lineasPorRE++;
            }else{
                worksheet.addRow([null, element.RE, "Sin indicadores registrados", null]);
                lineasPorRE++;
                worksheet.mergeCells(8+auxNumLineasRE+lineasPorRE-1,3,8+auxNumLineasRE+lineasPorRE-1,4);
            }
            for(let i=1;i<element.indicadores.length;i++){
                worksheet.addRow([null, null, element.indicadores[i].ID, element.indicadores[i].porcentajeLogro]);
                lineasPorRE++;
            }
            worksheet.mergeCells(8+auxNumLineas,2,8+lineasPorRE+auxNumLineas-1,2);
            auxNumLineas=auxNumLineas+lineasPorRE;
            lineasPorRE=0;
        });
        worksheet.columns[1].width=20;
        worksheet.columns[2].width=50;
        worksheet.columns[3].width=50;
        worksheet.columns[2].alignment={wrapText:true};
        worksheet.columns[3].numFmt="0.00";
    }else if(header.idDes===4){
        worksheet.addRow([null, "Codigo resultado", "Porcentaje Logro(%)"]);

        worksheet.getCell(7,2).fill={ type:'pattern', pattern:'solid', fgColor:{argb:'66E0C3'} };
        worksheet.getCell(7,3).fill={ type:'pattern', pattern:'solid', fgColor:{argb:'66E0C3'} };
        worksheet.getCell(7,2).font={ name:'Comic Sans MS', size:11, bold:true };
        worksheet.getCell(7,3).font={ name:'Comic Sans MS', size:11, bold:true };
        worksheet.getCell(7,2).alignment={ horizontal:'center' };
        worksheet.getCell(7,3).alignment={ horizontal:'center' };

        worksheet.columns[1].alignment={wrapText:true};
        worksheet.columns[2].alignment={wrapText:true};

        console.log(data.data.data);
        data.data.data.forEach(element => {
            worksheet.addRow([null, element.RE, element.porcentajeLogro]);
        });
        console.log(data);
        worksheet.columns[1].width=20;
        worksheet.columns[2].width=50;
        worksheet.columns[2].numFmt="0.00";
    }

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

function reporteConsolidado(worksheet, header, data){

}





function reporteActividadesMejora(worksheet, header, data){
    console.log("Inicio de fx reporteActividadesMejora...");
    console.log("Worksheet: ", worksheet);
    console.log("Header:", header.nombreFacultad, header.nombreEspecialidad, header.anho_in, header.anho_fin, header.estado_act);
    console.log("Data: ", data);
    
    worksheet.addRow([null, "Reporte de Planes de mejora", "asdasdsa"]);
    worksheet.mergeCells(0,2,0,3);
    worksheet.addRow([null, "Facultad: ", header.nombreFacultad]);
    worksheet.addRow([null, "Especialidad: ", header.nombreEspecialidad]);
    worksheet.addRow([null, "Rango de años: ", header.anho_in, header.anho_fin]);
    worksheet.addRow([null, "Actividades en Estado: ", header.estado_act]);

    worksheet.addRow();
    worksheet.addRow();

    
    worksheet.addRow([null, "Año de Registro", "Oportunidad de Mejora", "Propuesta", "Actividad", "Estado", "Inicio", "Fin", "Responsable", "Hito de Seguimiento", "Evidencia"]);


    let lineasPorActividad=0;
    let auxLineasPorActividad=0;
    let lineasPorSeguimiento = 0;
    let auxLineasPorSeguimiento = 0;
    
    try{//me toca intentar, enma
        data.data.plan_mejora.forEach(element => {//element es la oportunidad de mejora, "mejoras" son las propuestas
            console.log(element.mejoras);
            for(let m=0;m<element.mejoras.length;m++){
                for(let a=0;a<element.mejoras[m].actividades.length;a++){
                    if(element.mejoras[m].actividades[a].seguimientos.length>0){
                        if(element.mejoras[m].actividades[a].seguimientos[0].archivos_seguimiento.length > 0){
                            console.log("entra");
                            worksheet.addRow([null, element.anho, element.descripcion, element.mejoras[m].descripcion, 
                                element.mejoras[m].actividades[a].descripcion, element.mejoras[m].actividades[a].estado_act,
                                element.mejoras[m].actividades[a].ciclo_inicio, element.mejoras[m].actividades[a].ciclo_fin, 
                                element.mejoras[m].actividades[a].responsable, element.mejoras[m].actividades[a].seguimientos[0].descripcion,
                                element.mejoras[m].actividades[a].seguimientos[0].archivos_seguimiento[0].nombre
                            ]);
                            lineasPorActividad++;
                            lineasPorSeguimiento++;
                            for(let i=1;i<element.mejoras[m].actividades[a].seguimientos[0].archivos_seguimiento.length; i++){
                                worksheet.addRow([null, null, null, null, null, null, null, null, null, null,
                                    element.mejoras[m].actividades[a].seguimientos[0].archivos_seguimiento[i].nombre
                                ]);
                                lineasPorActividad++;
                                lineasPorSeguimiento++;
                            }
                            worksheet.mergeCells(9+auxLineasPorActividad,10,9+lineasPorSeguimiento+auxLineasPorActividad-1,10);
                        }else{
                            worksheet.addRow([null, element.anho, element.descripcion, element.mejoras[m].descripcion, 
                                element.mejoras[m].actividades[a].descripcion, element.mejoras[m].actividades[a].estado_act,
                                element.mejoras[m].actividades[a].ciclo_inicio, element.mejoras[m].actividades[a].ciclo_fin,
                                element.mejoras[m].actividades[a].responsable, element.mejoras[m].actividades[a].seguimientos[0].descripcion,
                                "No se registraron archivos de seguimiento"
                            ]);
                            lineasPorActividad++;
                        }
                    }else{
                        worksheet.addRow([null, element.anho, element.descripcion, element.mejoras[m].descripcion, 
                            element.mejoras[m].actividades[a].descripcion, element.mejoras[m].actividades[a].estado_act,
                            element.mejoras[m].actividades[a].ciclo_inicio, element.mejoras[m].actividades[a].ciclo_fin, 
                            element.mejoras[m].actividades[a].responsable, "Sin hitos registrados"
                        ]);
                        lineasPorActividad++;
                        worksheet.mergeCells(9+auxLineasPorActividad+lineasPorActividad-1,10,9+auxLineasPorActividad+lineasPorActividad-1,11);
                    }
                    auxLineasPorSeguimiento=auxLineasPorActividad+lineasPorActividad;
                    lineasPorSeguimiento=0;
                    for(let j=1;j<element.mejoras[m].actividades[a].seguimientos.length;j++){//for de los hitos
                        if(element.mejoras[m].actividades[a].seguimientos[j].archivos_seguimiento.length>0){
                            worksheet.addRow([null, null, null, null, null, null, null, null, null,
                                element.mejoras[m].actividades[a].seguimientos[j].descripcion,
                                element.mejoras[m].actividades[a].seguimientos[j].archivos_seguimiento[0].nombre
                            ]);
                            lineasPorActividad++;
                            lineasPorSeguimiento++;
                            for(let k=1;k<element.mejoras[m].actividades[a].seguimientos[j].archivos_seguimiento.length;k++){
                                worksheet.addRow([null, null, null, null, null, null, null, null, null, null,
                                    element.mejoras[m].actividades[a].seguimientos[j].archivos_seguimiento[k].nombre
                                ]);
                                lineasPorActividad++;
                                lineasPorSeguimiento++;
                            }
                        }else{
                            worksheet.addRow([null, null, null, null, null, null, null, null, null,
                                element.mejoras[m].actividades[a].seguimientos[j].descripcion, "No se registraron archivos de seguimiento"
                            ]);
                            lineasPorActividad++;
                            lineasPorSeguimiento++;
                        }
                        worksheet.mergeCells(9+auxLineasPorSeguimiento,10,9+lineasPorSeguimiento+auxLineasPorSeguimiento-1,10);
                        auxLineasPorSeguimiento=auxLineasPorSeguimiento+lineasPorSeguimiento;
                        lineasPorSeguimiento=0;
                    }
                    worksheet.mergeCells(9+auxLineasPorActividad,2,9+lineasPorActividad+auxLineasPorActividad-1,2);
                    worksheet.mergeCells(9+auxLineasPorActividad,3,9+lineasPorActividad+auxLineasPorActividad-1,3);
                    worksheet.mergeCells(9+auxLineasPorActividad,4,9+lineasPorActividad+auxLineasPorActividad-1,4);
                    worksheet.mergeCells(9+auxLineasPorActividad,5,9+lineasPorActividad+auxLineasPorActividad-1,5);
                    worksheet.mergeCells(9+auxLineasPorActividad,6,9+lineasPorActividad+auxLineasPorActividad-1,6);
                    worksheet.mergeCells(9+auxLineasPorActividad,7,9+lineasPorActividad+auxLineasPorActividad-1,7);
                    worksheet.mergeCells(9+auxLineasPorActividad,8,9+lineasPorActividad+auxLineasPorActividad-1,8);
                    worksheet.mergeCells(9+auxLineasPorActividad,9,9+lineasPorActividad+auxLineasPorActividad-1,9);
                    auxLineasPorActividad=auxLineasPorActividad+lineasPorActividad;
                    lineasPorActividad=0;
                    auxLineasPorSeguimiento=auxLineasPorActividad;
                    lineasPorSeguimiento=0;
                }
            }
        });
    }catch(err){
        console.log(err);
    }

    worksheet.columns[1].width=10;
    worksheet.columns[2].width=35;
    worksheet.columns[3].width=35;
    worksheet.columns[4].width=35;
    worksheet.columns[5].width=15;
    worksheet.columns[6].width=15;
    worksheet.columns[7].width=15;
    worksheet.columns[8].width=15;
    worksheet.columns[9].width=35;
    worksheet.columns[10].width=25;

    worksheet.columns[1].alignment={wrapText:true};
    worksheet.columns[2].alignment={wrapText:true};
    worksheet.columns[3].alignment={wrapText:true};
    worksheet.columns[4].alignment={wrapText:true};
    worksheet.columns[5].alignment={wrapText:true};
    worksheet.columns[6].alignment={wrapText:true};
    worksheet.columns[7].alignment={wrapText:true};
    worksheet.columns[8].alignment={wrapText:true};
    worksheet.columns[9].alignment={wrapText:true};
    worksheet.columns[10].alignment={wrapText:true};

    
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

    worksheet.getCell(8,2).fill={ type:'pattern', pattern:'solid', fgColor:{argb:'66E0C3'} };
    worksheet.getCell(8,3).fill={ type:'pattern', pattern:'solid', fgColor:{argb:'66E0C3'} };
    worksheet.getCell(8,4).fill={ type:'pattern', pattern:'solid', fgColor:{argb:'66E0C3'} };
    worksheet.getCell(8,5).fill={ type:'pattern', pattern:'solid', fgColor:{argb:'66E0C3'} };
    worksheet.getCell(8,6).fill={ type:'pattern', pattern:'solid', fgColor:{argb:'66E0C3'} };
    worksheet.getCell(8,7).fill={ type:'pattern', pattern:'solid', fgColor:{argb:'66E0C3'} };
    worksheet.getCell(8,8).fill={ type:'pattern', pattern:'solid', fgColor:{argb:'66E0C3'} };
    worksheet.getCell(8,9).fill={ type:'pattern', pattern:'solid', fgColor:{argb:'66E0C3'} };
    worksheet.getCell(8,10).fill={ type:'pattern', pattern:'solid', fgColor:{argb:'66E0C3'} };
    worksheet.getCell(8,11).fill={ type:'pattern', pattern:'solid', fgColor:{argb:'66E0C3'} };
    
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
    })
}



export function DExcel(title = "Reporte", workSheetName = "Datos", header, data, option) {
    // Crea un nuevo libro
    let workbook = new Workbook();

    // Crea una nueva hoja
    let worksheet = workbook.addWorksheet(workSheetName);

    switch(option) {
        case "H":   worksheet = reporteHistorico(worksheet, header, data);
                    break;
        case "RE":  worksheet = reporteResultadosEstudiante(worksheet, header, data);
                    break;
        case "C":   worksheet = reporteConsolidado(worksheet, header, data);
                    break;
        case "AM":  worksheet = reporteActividadesMejora(worksheet, header, data);

    }

    //Descargar el archivo
    workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
        fs.saveAs(blob, title + '.xlsx');
    });
}