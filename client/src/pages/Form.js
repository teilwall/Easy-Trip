// import React, { useState } from "react";
// import { Formik, Form, Field, ErrorMessage } from "formik";
// import { CitySelect, StateSelect, CountrySelect } from "react-country-state-city";
// import "react-country-state-city/dist/react-country-state-city.css";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import Select from "react-dropdown-select";
// import axios from "axios";

// function MyForm() {
//   const kinds = [
//     {label: "Art&Cultural", value: 1},
//     {label: "Historical", value: 2},
//     {label: "Shopping", value: 3},
//     {label: "Amusment Parks", value: 4},
//     {label: "Museums", value: 5},
//     {label: "Outdoor Adventures", value: 6}
//   ]
//   const [countryid, setCountryid] = useState(0);
//   const [stateid, setStateid] = useState(0);
//   const [cityName, setCityName] = useState('');
//   const [lat, setLat] = useState(0);
//   const [lon, setLon] = useState(0);
//   const [fromDate, setFromDate] = useState(new Date());
//   const [toDate, setToDate] = useState(new Date());
//   const [choosenKinds, setChoosenKinds] = useState('');

//   const handleFromDateChange = (date) => {
//     setFromDate(date);
//     // Automatically adjust toDate if it's not within the range
//     if (!toDate || date > toDate) {
//       setToDate(new Date(date.getTime() + 10 * 24 * 60 * 60 * 1000));
//     }
//   };

//   const handleToDateChange = (date) => {
//     setToDate(date);
//   };

//   const handleChoosenKindsChange = (kinds) => {
//     const res = kinds.map(kind => kind.label);
//     setChoosenKinds(JSON.stringify(res));
//   }

//   return (
//     <div>
//       <Formik
//         initialValues={{
//           fromDate: null,
//           toDate: null,
//         }}
//         onSubmit={(values, { setSubmitting }) => {
//           setTimeout(() => {
//             console.log(fromDate.toISOString());
//             // const fromDateStr = fromDate.toISOString().split('T')[0];
//             // const toDateStr = toDate.toISOString().split('T')[0];
//             const fromDateStr = JSON.stringify(fromDate);
//             const toDateStr = JSON.stringify(toDate);
//             console.log(fromDateStr, toDateStr, choosenKinds);
//             const data = {
//                 cityName,
//                 lat,
//                 lon,
//                 fromDateStr,
//                 toDateStr,
//                 // fromDate: values.fromDate,
//                 // toDate: values.toDate,
//                 // choosenKinds: choosenKinds.map(kind => kind.label)
//                 choosenKinds
//             }
//             axios.post('/apiForm', data)
//               .then(response => {
//                 // Handle success response
//                 console.log(response.data);
//               })
//               .catch(error => {
//                 // Handle error
//                 console.error('Error:', error);
//               });
//             // alert(JSON.stringify(values, null, 2));
//             setSubmitting(false);
//           }, 400);
//         }}
//       >
//         {({ isSubmitting }) => (
//           <Form>
//             <div>
//               <h6>Country</h6>
//               <CountrySelect
//                 onChange={(e) => {
//                   setCountryid(e.id);
//                 }}
//                 placeHolder="Select Country"
//               />
//             </div>
//             <div>
//               <h6>State</h6>
//               <StateSelect
//                 countryid={countryid}
//                 onChange={(e) => {
//                   setStateid(e.id);
//                 }}
//                 placeHolder="Select State"
//               />
//             </div>
//             <div>
//               <h6>City</h6>
//               <CitySelect
//                 countryid={countryid}
//                 stateid={stateid}
//                 onChange={(e) => {
//                   setCityName(e.name);
//                   setLat(e.latitude);
//                   setLon(e.longitude);
//                   console.log(e);
//                   console.log(cityName, lat, lon);
//                 }}
//                 placeHolder="Select City"
//               />
//             </div>
//             <div>
//               <h6>From Date</h6>
//               <DatePicker
//                 selected={fromDate}
//                 onChange={handleFromDateChange}
//                 selectsStart
//                 startDate={fromDate}
//                 endDate={toDate}
//                 minDate={new Date()}
//                 placeholderText="Select From Date"
//               />
//               <Field type="hidden" name="fromDate" value={fromDate} />
//             </div>
//             <div>
//               <h6>To Date</h6>
//               <DatePicker
//                 selected={toDate}
//                 onChange={handleToDateChange}
//                 selectsEnd
//                 startDate={fromDate}
//                 endDate={toDate}
//                 minDate={fromDate}
//                 maxDate={new Date(fromDate.getTime() + 10 * 24 * 60 * 60 * 1000)}
//                 placeholderText="Select To Date"
//               />
//               <Field type="hidden" name="toDate" value={toDate} />
//               <ErrorMessage name="toDate" component="div" />
//             </div>
//             <div>
//               <h6>Select the kind of activities you want to do</h6>
//               <Select
//                 name='select'
//                 options={kinds}
//                 multi
//                 onChange={ handleChoosenKindsChange }
//               >
//               </Select>
//             </div>
//             <button type="submit" disabled={isSubmitting}>
//               Submit
//             </button>
//           </Form>
//         )}
//       </Formik>
//     </div>
//   );
// }

// export default MyForm;


import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { CitySelect, StateSelect, CountrySelect } from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-dropdown-select";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import "./Form.css"; // Importing the CSS file for styling

function MyForm() {
  const navigate = useNavigate();

  const kinds = [
    { label: "Art&Cultural", value: 1 },
    { label: "Historical", value: 2 },
    { label: "Shopping", value: 3 },
    { label: "Amusement Parks", value: 4 },
    { label: "Museums", value: 5 },
    { label: "Outdoor Adventures", value: 6 }
  ];
  const [countryid, setCountryid] = useState(0);
  const [stateid, setStateid] = useState(0);
  const [cityName, setCityName] = useState('');
  const [lat, setLat] = useState(0);
  const [lon, setLon] = useState(0);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [chosenKinds, setChosenKinds] = useState('');
  const [placesPerDay, setPlacesPerDay] = useState('');
  const [numPeople, setNumPeople] = useState(1);
  const [budget, setBudget] = useState('');

  const handleFromDateChange = (date) => {
    setFromDate(date);
    // Automatically adjust toDate if it's not within the range
    if (!toDate || date > toDate) {
      setToDate(new Date(date.getTime() + 10 * 24 * 60 * 60 * 1000));
    }
  };

  const handleToDateChange = (date) => {
    setToDate(date);
  };

  const handleChosenKindsChange = (kinds) => {
    const res = kinds.map(kind => kind.label);
    setChosenKinds(JSON.stringify(res));
  };

  const handleBudgetSelection = (selectedBudget) => {
    setBudget(selectedBudget);
  };

  const handlePlacesPerDaySelection = (selectedPlacesPerDay) => {
    setPlacesPerDay(selectedPlacesPerDay);
  };

  return (
    <div className="form-container">
      <Formik
        initialValues={{
          fromDate: null,
          toDate: null,
        }}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            console.log(fromDate.toISOString());
            const fromDateStr = JSON.stringify(fromDate);
            const toDateStr = JSON.stringify(toDate);
            console.log(fromDateStr, toDateStr, chosenKinds);
            const data = {
              cityName,
              lat,
              lon,
              fromDateStr,
              toDateStr,
              chosenKinds,
              placesPerDay,
              numPeople,
              budget
            };
            axios.post('/apiForm', data)
              .then(response => {
                // Handle success response
                console.log(response.data);
              })
              .catch(error => {
                // Handle error
                console.error('Error:', error);
              });
            // jump to next page
            navigate('/map');
            setSubmitting(false);
          }, 400);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="form-section">
              <h6>Country</h6>
              <CountrySelect
                onChange={(e) => {
                  setCountryid(e.id);
                }}
                placeHolder="Select Country"
              />
            </div>
            <div className="form-section">
              <h6>State</h6>
              <StateSelect
                countryid={countryid}
                onChange={(e) => {
                  setStateid(e.id);
                }}
                placeHolder="Select State"
              />
            </div>
            <div className="form-section">
              <h6>City</h6>
              <CitySelect
                countryid={countryid}
                stateid={stateid}
                onChange={(e) => {
                  setCityName(e.name);
                  setLat(e.latitude);
                  setLon(e.longitude);
                }}
                placeHolder="Select City"
              />
            </div>
            <div className="date-picker-wrapper form-section">
              <div>
                <h6>From Date</h6>
                <DatePicker
                  selected={fromDate}
                  onChange={handleFromDateChange}
                  selectsStart
                  startDate={fromDate}
                  endDate={toDate}
                  minDate={new Date()}
                  placeholderText="Select From Date"
                />
                <Field type="hidden" name="fromDate" value={fromDate} />
              </div>
              <div>
                <h6>To Date</h6>
                <DatePicker
                  selected={toDate}
                  onChange={handleToDateChange}
                  selectsEnd
                  startDate={fromDate}
                  endDate={toDate}
                  minDate={fromDate}
                  maxDate={new Date(fromDate.getTime() + 10 * 24 * 60 * 60 * 1000)}
                  placeholderText="Select To Date"
                />
                <Field type="hidden" name="toDate" value={toDate} />
                <ErrorMessage name="toDate" component="div" />
              </div>
            </div>
            <div className="form-section">
              <h6>Select the kind of activities you want to do</h6>
              <Select
                name='select'
                options={kinds}
                multi
                onChange={handleChosenKindsChange}
              />
            </div>
            <div className="form-section">
              <h6>Number of places per day</h6>
              <div className="button-group">
                <button
                  type="button"
                  className={placesPerDay === "1-2" ? "selected" : ""}
                  onClick={() => handlePlacesPerDaySelection("1-2")}
                >
                  1-2
                </button>
                <button
                  type="button"
                  className={placesPerDay === "3-4" ? "selected" : ""}
                  onClick={() => handlePlacesPerDaySelection("3-4")}
                >
                  3-4
                </button>
              </div>
            </div>
            <div className="form-section">
              <h6>Number of people</h6>
              <input
                type="number"
                min="1"
                max="10"
                value={numPeople}
                onChange={(e) => setNumPeople(e.target.value)}
              />
            </div>
            <div className="form-section">
              <h6>Budget</h6>
              <div className="button-group">
                <button
                  type="button"
                  className={budget === "budget" ? "selected" : ""}
                  onClick={() => handleBudgetSelection("budget")}
                >
                  Budget
                </button>
                <button
                  type="button"
                  className={budget === "medium" ? "selected" : ""}
                  onClick={() => handleBudgetSelection("medium")}
                >
                  Medium
                </button>
                <button
                  type="button"
                  className={budget === "gold" ? "selected" : ""}
                  onClick={() => handleBudgetSelection("gold")}
                >
                  Gold
                </button>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default MyForm;

