import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { CitySelect, StateSelect, CountrySelect } from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-dropdown-select";
import axios from "axios";

function MyForm() {
  const kinds = [
    {label: "Art&Cultural", value: 1},
    {label: "Historical", value: 2},
    {label: "Shopping", value: 3},
    {label: "Amusment Parks", value: 4},
    {label: "Museums", value: 5},
    {label: "Outdoor Adventures", value: 6}
  ]
  const [countryid, setCountryid] = useState(0);
  const [stateid, setStateid] = useState(0);
  const [cityName, setCityName] = useState('');
  const [lat, setLat] = useState(0);
  const [lon, setLon] = useState(0);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [choosenKinds, setChoosenKinds] = useState([]);

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

  return (
    <div>
      <Formik
        initialValues={{
          fromDate: null,
          toDate: null,
        }}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            const data = {
                cityName,
                lat,
                lon,
                fromDate: values.fromDate,
                toDate: values.toDate,
                choosenKinds: choosenKinds.map(kind => kind.label)
            }
            axios.post('/apiForm', data)
              .then(response => {
                // Handle success response
                console.log(response.data);
              })
              .catch(error => {
                // Handle error
                console.error('Error:', error);
              });
            // alert(JSON.stringify(values, null, 2));
            setSubmitting(false);
          }, 400);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <div>
              <h6>Country</h6>
              <CountrySelect
                onChange={(e) => {
                  setCountryid(e.id);
                }}
                placeHolder="Select Country"
              />
            </div>
            <div>
              <h6>State</h6>
              <StateSelect
                countryid={countryid}
                onChange={(e) => {
                  setStateid(e.id);
                }}
                placeHolder="Select State"
              />
            </div>
            <div>
              <h6>City</h6>
              <CitySelect
                countryid={countryid}
                stateid={stateid}
                onChange={(e) => {
                  setCityName(e.name);
                  setLat(e.latitude);
                  setLon(e.longitude);
                  console.log(e);
                  console.log(cityName, lat, lon);
                }}
                placeHolder="Select City"
              />
            </div>
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
            <div>
              <h6>Select the kind of activities you want to do</h6>
              <Select
                name='select'
                options={kinds}
                multi
                onChange={(e)=>{
                  setChoosenKinds(e);
                  // console.log(choosenKinds);
                } }
              >
              </Select>
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
