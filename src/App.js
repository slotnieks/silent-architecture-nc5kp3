import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper
} from "@material-ui/core";
import "./styles.css";

const App = () => {
  const [people, setPeople] = useState([]);
  const [expandedPerson, setExpandedPerson] = useState(null);
  const [expandedVehicle, setExpandedVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllPeople = async () => {
      try {
        const allPeople = await getAllPeople("https://swapi.dev/api/people");
        const sortedPeople = sortPeople(allPeople);
        setPeople(sortedPeople);
        setIsLoading(false);
      } catch (error) {
        console.log("Error:", error);
      }
    };

    fetchAllPeople();
  }, []);

  const sortPeople = (peopleArr) => {
    return peopleArr.sort((a, b) => a.name.localeCompare(b.name));
  };

  const getAllPeople = async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    if (response.ok) {
      const extractedPeople = data.results.map(async (person) => {
        const vehicles = await Promise.all(
          person.vehicles.map(async (vehicleUrl) => {
            const vehicleResponse = await fetch(vehicleUrl);
            const vehicleData = await vehicleResponse.json();
            return {
              name: vehicleData.name,
              model: vehicleData.model,
              manufacturer: vehicleData.manufacturer,
              crew: vehicleData.crew
            };
          })
        );

        return {
          name: person.name,
          details: {
            gender: person.gender,
            birth_year: person.birth_year,
            vehicles: vehicles
          }
        };
      });

      if (data.next !== null) {
        const nextPagePeople = await getAllPeople(data.next);
        return Promise.all([...extractedPeople, ...nextPagePeople]);
      } else {
        return Promise.all(extractedPeople);
      }
    } else {
      throw new Error("Failed to retrieve data from the API.");
    }
  };

  const handleRowClick = (index) => {
    setExpandedPerson(index === expandedPerson ? null : index);
  };

  const handleVehicleClick = (index) => {
    setExpandedVehicle(index === expandedVehicle ? null : index);
  };

  useEffect(() => {
    setPeople(
      (prevPeople) => prevPeople.sort((a, b) => a.name.localeCompare(b.name)) // Sort the people array by name
    );
  }, []);

  return (
    <div>
      <h1>Star Wars Characters!</h1>
      {isLoading ? (
        <p>Loading data...</p>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              {people.map((person, personIndex) => (
                <React.Fragment key={personIndex}>
                  <TableRow onClick={() => handleRowClick(personIndex)}>
                    <TableCell>{person.name}</TableCell>
                  </TableRow>
                  {expandedPerson === personIndex && (
                    <TableRow>
                      <TableCell colSpan={2}>
                        <TableContainer component={Paper}>
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell>Gender:</TableCell>
                                <TableCell>{person.details.gender}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Birth Year:</TableCell>
                                <TableCell>
                                  {person.details.birth_year}
                                </TableCell>
                              </TableRow>
                              {person.details.vehicles.length > 0 && (
                                <TableRow>
                                  <TableCell colSpan={2}>
                                    <TableContainer component={Paper}>
                                      <Table>
                                        <TableBody>
                                          {person.details.vehicles.map(
                                            (vehicle, vehicleIndex) => (
                                              <React.Fragment
                                                key={vehicleIndex}
                                              >
                                                <TableRow
                                                  onClick={() =>
                                                    handleVehicleClick(
                                                      vehicleIndex
                                                    )
                                                  }
                                                >
                                                  <TableCell>
                                                    Vehicle:
                                                  </TableCell>
                                                  <TableCell>
                                                    {vehicle.name}
                                                  </TableCell>
                                                </TableRow>
                                                {expandedVehicle ===
                                                  vehicleIndex && (
                                                  <TableRow>
                                                    <TableCell colSpan={2}>
                                                      <TableContainer
                                                        component={Paper}
                                                      >
                                                        <Table>
                                                          <TableBody>
                                                            <TableRow>
                                                              <TableCell>
                                                                Model:
                                                              </TableCell>
                                                              <TableCell>
                                                                {vehicle.model}
                                                              </TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                              <TableCell>
                                                                Manufacturer:
                                                              </TableCell>
                                                              <TableCell>
                                                                {
                                                                  vehicle.manufacturer
                                                                }
                                                              </TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                              <TableCell>
                                                                Crew:
                                                              </TableCell>
                                                              <TableCell>
                                                                {vehicle.crew}
                                                              </TableCell>
                                                            </TableRow>
                                                          </TableBody>
                                                        </Table>
                                                      </TableContainer>
                                                    </TableCell>
                                                  </TableRow>
                                                )}
                                              </React.Fragment>
                                            )
                                          )}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default App;
