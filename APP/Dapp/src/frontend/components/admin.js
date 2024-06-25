import React, { useEffect } from 'react';
import Highcharts from 'highcharts';

const AdminDashboard = () => {
    const chartEnergy = () => {
        Highcharts.chart('energy-container', {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Energía Producida vs Consumida último mes'
            },
            xAxis: {
                categories: ['Energía']
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Energía (kWh)'
                }
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.y:.1f} kWh</b>',
                useHTML: true
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: [{
                name: 'Energía Producida',
                data: [49.9]
            }, {
                name: 'Energía consumida de la comunidad',
                data: [83.6]
            }]
        });
    };

    const pieEnergy = () => {
        Highcharts.chart('pie-container', {
            chart: {
                type: 'pie'
            },
            title: {
                text: 'Origen Energía'
            },
            tooltip: {
                valueSuffix: '%'
            },

            plotOptions: {
                series: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: [{
                        enabled: true,
                        distance: 20
                    }, {
                        enabled: true,
                        distance: -40,
                        format: '{point.percentage:.1f}%',
                        style: {
                            fontSize: '1.2em',
                            textOutline: 'none',
                            opacity: 0.7
                        },
                        filter: {
                            operator: '>',
                            property: 'percentage',
                            value: 10
                        }
                    }]
                }
            },
            series: [
                {
                    name: 'Percentage',
                    colorByPoint: true,
                    data: [
                        { name: 'Red eléctrica', y: 55.02 },
                        { name: 'Autogenerada', sliced: true, selected: true, y: 26.71 },
                        { name: 'Miembros Comunidad', y: 18.27 }

                    ]
                }
            ]
        });
    };

    const chartLineal = () => {
        Highcharts.chart('container-lineal', {
            chart: {
                type: 'line'
            },
            title: {
                text: 'Comparativa Mensual de Energía Consumida vs. Producida'
            },
            subtitle: {
                text: 'Fuente: <a href="https://en.wikipedia.org/wiki/List_of_cities_by_average_temperature" target="_blank">Wikipedia.com</a>'
            },
            xAxis: {
                categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                title: {
                    text: 'Mes'
                }
            },
            yAxis: {
                title: {
                    text: 'Energía (kWh)'
                }
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true
                    },
                    enableMouseTracking: true // Habilitar seguimiento del mouse para tooltips
                }
            },
            series: [{
                name: 'Energía Consumida',
                data: [145.0, 182.5, 123.1, 120.9, 120.2, 186.4, 189.8, 188.4, 135.5, 192.2, 212.0, 217.8],
                color: '#FF6347' // Color rojo para la energía consumida
            }, {
                name: 'Energía Producida',
                data: [59.0, 56, 56, 75.8, 85.2, 94.5, 97.6, 96.5, 86.0, 66.5, 62.0, 64.9],
                color: '#4682B4' // Color azul para la energía producida
            }]
        });
    };

    // useEffect to ensure the charts are rendered after the component mounts
    useEffect(() => {
        chartEnergy();
        pieEnergy();
        chartLineal();
    }, []); // Empty dependency array means this effect will only run once after the initial render

    return (
        <div className="container-fluid">
            <div className="row" style={{ marginTop: '3rem' }}>
                <div className="col-md-6">
                    <div id="energy-container" style={{ height: '400px', width: '100%' }}></div>
                </div>
                <div className="col-md-6">
                    <div id="pie-container" style={{ height: '400px', width: '100%' }}></div>
                </div>
                <div style={{ marginTop: '2.5rem' }} id='container-lineal'></div>
            </div>
        </div>
    );
};

export default AdminDashboard;
