// last update
import React, {useState,useEffect} from 'react';
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  useRouteError
} from "react-router-dom";


var warning = false;
var lastReading = 0;
function TotalReadings(){
  const [dataData, setDataData] = useState([]);

  // GET /data
  useEffect(() => {
    fetch('https://coe558-2zl078a7.ue.gateway.dev/getdata')
      .then((res) => res.json())
      .then(res => {
        console.log('Response Data:', res);
        if (res && Array.isArray(res.data)) {
          setDataData(res.data);
        } else {
          throw new Error('Invalid response format');
        }
      })
      .catch(error => console.error('Error fetching data:', error));
  });

  return(
    <div className="col-sm-4">
        <div className="well">
            <h4>Readings</h4>
            <p>{dataData.length} sensors' readings</p> 
        </div>
    </div>
  );
}

function LineChart(){
  const [sensorData, setSensorData] = useState([]);
  // GET /data
  useEffect(() => {
      // GET getZone 771 to display sensors with data
    fetch('https://coebe-jnsbi3o3ma-uc.a.run.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            getSensor(sensorId: 7711) {
              sensorId
              sensorName
              zoneId
              data{
                value
                timestamp
              }
            }
          }
        `
      }),
    })
    .then(response => response.json())
    .then(data => {
      let sensorName = data.data.getSensor.sensorName;
      setSensorData(data.data.getSensor.data)
      const xTimeStamp = [];
      const yReadings = [];

      // Limit number of printed data points for each sensor
      const limitedData = sensorData.slice(-10); 
      const lastReading = sensorData.slice(-1); 

      // Loop through sensors for each zone
      limitedData.forEach(reading => {
        yReadings.push(reading.value);

        let date = new Date(reading.timestamp * 1).toISOString().slice(11, 16).replace('T', ' ');
        xTimeStamp.push(date);
      });

      new Chart("lineChart", {
        type: "line",
        data: {
          labels: xTimeStamp,
          datasets: [{
            backgroundColor:"rgba(0,0,255,1.0)",
            borderColor: "rgba(0,0,255,0.1)",
            data: yReadings,
            fill: false,
            lineTension: 0,
          }]
        },
        options: {
          legend: {
            display: false
          },
          
          title: {
            display: true,
            text:  "Sensor:" +sensorName
          },
          animation: {
            duration: 0 // Set the duration to 0 to disable initial animation
          }
        }
      });
      console.log('last reading:',lastReading)
      if(lastReading[0].value >= 80 && !warning){
        warning = true;
        Swal.fire({
          icon: "warning",
          html: "<h4>Sensor reading reach 80 °C !</h4>",
          confirmButtonColor: "#1f629c",
        });
      }

    })
    .catch(error => {
      console.error('Error:', error);
    });
  });

  return(
    <div className="col-sm-6">
      <div className="well">
          <canvas id="lineChart"></canvas>
      </div>
    </div>

  );

}

function Dashboard() {
  const [zoneData, setZoneData] = useState([]);
  const [sensorData, setSensorData] = useState([]);
  // REST APIs
  // GET /zones
  useEffect(() => {
      fetch('https://coe558-2zl078a7.ue.gateway.dev/getzones')
        .then((res) => res.json())
        .then(res => {
          console.log('Response Zones:', res);
          if (res && Array.isArray(res.data)) {
            setZoneData(res.data);
          } else {
            throw new Error('Invalid response format');
          }
        })
        .catch(error => console.error('Error fetching data:', error));
  }, []);

  // GET /sensors
  useEffect(() => {
    fetch('https://coe558-2zl078a7.ue.gateway.dev/getsensor')
      .then((res) => res.json())
      .then(res => {
        console.log('Response Sensors:', res);
        if (res && Array.isArray(res.data)) {
          setSensorData(res.data);
        } else {
          throw new Error('Invalid response format');
        }
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  

  // GraphQL 
  // GET getLimitZones in ascending order
  fetch('https://coebe-jnsbi3o3ma-uc.a.run.app/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query {
          getLimitZones(limitNo:3) {
            zoneId
            zoneName
            sensors {
              sensorName
            }
          }
        }
      `
    }),
  })
  .then(response => response.json())
  .then(data => {
    const zones = data.data.getLimitZones;
    const xValues = [];
    const yValues = [];
    const barColors = [
      "#b91d47",
      "#00aba9",
      "#2b5797",
      // "#e8c3b9",
      // "#1e7145"
    ];

    // Loop through each retrieved zone
    zones.forEach(zone => {
      xValues.push(zone.zoneName);
      yValues.push(zone.sensors.length);
    });

    new Chart("pieChart", {
      type: "pie",
      data: {
        labels: xValues,
        datasets: [{
          backgroundColor: barColors,
          data: yValues
        }]
      },
      options: {
        title: {
          display: true,
          text: "Sensors Distribution"
        },
      }
    });

  })
  .catch(error => {
    console.error('Error:', error);
  });

  


    return (
            <div id="dashboard_page">
                <div className="row">
                    <div className="col-sm-4">
                        <div className="well">
                            <h4>Zones</h4>
                            <p>{zoneData.length} Zones</p> 
                        </div>
                    </div>
                    <div className="col-sm-4">
                        <div className="well">
                            <h4>Sensors</h4>
                            <p>{sensorData.length} sensors</p> 
                        </div>
                    </div>
                    <TotalReadings />
                </div>
                <div className="row">
                  <div className="col-sm-12">
                    <h4>Dashboard</h4>
                    <div className="col-sm-6">
                      <div className="well">
                          <canvas id="pieChart"></canvas>
                      </div>
                    </div>
                    <LineChart/>
                  </div>
                </div>
            </div>
      );
}

function Data() {
    const [zoneData, setZoneData] = useState([]);

    // Get /zones --> for dropdown list
    useEffect(() => {
        fetch('https://coe558-2zl078a7.ue.gateway.dev/getzones')
          .then((res) => res.json())
          .then(res => {
            console.log('Response:', res);
      
            if (res && Array.isArray(res.data)) {
              // Map the data array to a new format
              const mappedData = res.data.map(item => {
                // Transform the item into a new format. Adjust as needed.
                return {
                  zoneId: item.zoneId,
                  zoneName: item.zoneName,
                  id:item._id
                  // Include any other properties you need from 'item'
                };
              });
              setZoneData(mappedData);
            } else {
              throw new Error('Invalid response format');
            }
          })
          .catch(error => console.error('Error fetching data:', error));
    },);

    const [searchZoneId, setSearchZoneId] = useState('');

    const [zoneId, setZoneId] = useState('');
    const [zoneName, setZoneName] = useState('');
    const resetZoneState = () => {
      setZoneId(''); 
      setZoneName('');
    };

    const [sensorId, setSensorId] = useState('');
    const [sensorName, setSensorName] = useState('');
    const [sensorType, setSensorType] = useState('');
    const [sensorLocation, setSensorLocation] = useState('');
    const resetSensorState = () => {
      setSensorId(''); 
      setSensorName('');
      setSensorType('');
      setSensorLocation('');
    };
    // REST API
    // POST /zone
    // const handleZoneSubmit = (event) => {
    //   event.preventDefault(); // Prevents the default form submission behavior
    //   const zoneData = {
    //     zoneId: zoneId,
    //     zoneName: zoneName,
    //   };

    //   fetch('https://becoe558-6zz5dmf32a-uc.a.run.app/zone', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json', // Set the Content-Type header for JSON data
    //       },
    //       body: JSON.stringify(zoneData), // Convert zoneData to JSON format
    //     })
    //   .then(response => {
    //     if (response.ok) {
    //       Swal.fire({
    //         icon: "success",
    //         title: "Success",
    //         text: "Zone has been added",
    //         showConfirmButton: false,
    //         timer: 1500
    //       });
    //       resetZoneState();
    //     } else {
          
    //       throw new Error('Failed to post zone data');
    //     }
    //   })
    //   .catch(error => {
    //     Swal.fire({
    //       icon: "error",
    //       title: "Error",
    //       text: error.message,
    //       confirmButtonColor: "#1f629c",
    //     });
    //   });
    // };
    
    // POST /sensor
    const handleSensorSubmit = (event) => {
      event.preventDefault(); // Prevents the default form submission behavior
  
      const sensorData = {
        zoneId: sensorLocation, // Zone Id
        sensorId: sensorId,
        sensorName: sensorName,
        sensorType: sensorType,
      };

      fetch('https://coebe-jnsbi3o3ma-uc.a.run.app/sensor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sensorData),
        })
      .then(response => {
        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Sensor has been added",
            showConfirmButton: false,
            timer: 1500
          });
          resetSensorState();
        } else {
          throw new Error('Failed to post sensor data');
        }
      })
      .catch(error => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
          confirmButtonColor: "#1f629c",
        });
      });
    };


    // GraphQL 
    // POST createZone(zoneId,zoneName)
    const handleZoneSubmit = (event) => {
      event.preventDefault(); // Prevents the default form submission behavior

      fetch('https://coebe-jnsbi3o3ma-uc.a.run.app/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation {
              createZone(zoneId: ${zoneId}, zoneName: "${zoneName}") {
                zoneId
                zoneName
              }
            }
          `
        })
      })
      .then(response => response.json())
      .then(data => {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "New zone created: "+ data.data.createZone,
          showConfirmButton: false,
          timer: 1500
        });
        resetZoneState();
      })
      .catch(error => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
          confirmButtonColor: "#1f629c",
        });
      });
    }

    // POST getZone(zoneId)
    const handleZoneSearch = (event) => {
      event.preventDefault(); // Prevents the default form submission behavior

      fetch('https://coebe-jnsbi3o3ma-uc.a.run.app/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              getZone(zoneId: ${searchZoneId}) {
                zoneId
                zoneName
                sensors{
                  sensorId
                }
              }
            }
          `
        })
      })
      .then(response => response.json())
      .then(data => {
        let zone = data.data.getZone;
        if(zone == null){
          Swal.fire({
            icon: "warning",
            html: "<h4>No zone with provided ID</h4>",
            confirmButtonColor: "#1f629c",
          });

        }
        else{
          let name = zone.zoneName;
          let sensorsCount = zone.sensors.length;
          Swal.fire({
            icon: "info",
            html: "<h4>Zone Name: "+ name + "</h4><h4>No. of Sensors: "+ sensorsCount + "</h4>",
            confirmButtonColor: "#1f629c",
          });
        } 
      })
      .catch(error => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
          confirmButtonColor: "#1f629c",
        });
      });
    }


    return (
            <div id="datacontrol_page">
            <div className="row">
                <div className="col-sm-6">
                    <div className="well">
                      <h4>Serach Zone Data</h4>
                      <form onSubmit={handleZoneSearch}>
                          <input type="number" 
                              min="0"
                              value={searchZoneId} 
                              onChange={e => setSearchZoneId(e.target.value)} 
                              placeholder='Zone Id'
                              required/>
                         
                          <input type="submit" value="Search Using GraphQL"/>
                      </form> 
                    </div>
                    
                    <div className="well">
                        <h4>Add Zone</h4>
                        <form onSubmit={handleZoneSubmit}>
                            <input type="number" 
                                value={zoneId} 
                                onChange={e => setZoneId(e.target.value)} 
                                placeholder='Zone Id'
                                required/>
                            <input type="text" 
                                value={zoneName} 
                                onChange={e => setZoneName(e.target.value)} 
                                placeholder='Zone Name'
                                required/>
                            <input type="submit" value="Add Using GraphQL"/>
                        </form> 
                    </div>
                </div>
                <div className="col-sm-6">
                    <div className="well">
                        <h4>Add Sensor</h4>
                        <form onSubmit={handleSensorSubmit}>
                            <select value={sensorLocation} onChange={e => setSensorLocation(e.target.value)} required>
                            <option value="" disabled>Select the zone</option>
                            {
                              zoneData.map((item) => (
                                  <option value={item.zoneId}>{item.zoneName}</option>
                              ))
                            }
                            </select>
                            <input type="number" 
                                value={sensorId} 
                                onChange={e => setSensorId(e.target.value)} 
                                placeholder='Sensor Id'
                                required/>
                            <input type="text" 
                                value={sensorName} 
                                onChange={e => setSensorName(e.target.value)} 
                                placeholder='Sensor Name'
                                required/>
                            <input type="text" 
                                value={sensorType} 
                                onChange={e => setSensorType(e.target.value)} 
                                placeholder='Sensor Type'
                                required/>
                            <input type="submit" value="Add Using REST API"/>
                        </form> 
                    </div>
                </div>
            </div>
        </div>
    );
}

function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}

const router = createBrowserRouter([
    {
      path: "/",
      element: <Dashboard />,
      errorElement: <ErrorPage />,
    },
    {
      path: "/data",
      element: <Data />,
      errorElement: <ErrorPage />,
    },
  ]);
  
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );