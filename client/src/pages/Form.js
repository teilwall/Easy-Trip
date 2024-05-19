import React, { useState } from "react";
import { useFormik } from "formik";
import { CitySelect, StateSelect, CountrySelect } from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-dropdown-select";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import "./Form.css";
import * as Yup from "yup";


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
  const [isSubmitting, setSubmitting] = useState(false);

  const handleCountryChange = (selectedCountryid) => {
    setCountryid(selectedCountryid.id);
    // formik.values.country = countryid; 
    formik.setFieldValue('country', selectedCountryid.id, true); 
  }

  const handleStateChange = (selectedStateid) => {
    setStateid(selectedStateid.id);
    // formik.values.state = stateid; 
    formik.setFieldValue('state', selectedStateid.id, true); 
  }

  const handleCityChange = (selectedCity) => {
    // formik.values.city = selectedCity.name; 
    formik.setFieldValue('city', selectedCity.name, true); 
    setCityName(selectedCity.name);
    setLat(selectedCity.latitude);
    setLon(selectedCity.longitude);
  }
  
  const handleFromDateChange = (date) => {
    setFromDate(date);
    // Automatically adjust toDate if it's not within the range
    if (!toDate || date > toDate) {
      setToDate(new Date(date.getTime() + 9 * 24 * 60 * 60 * 1000));
    }
  };

  const handleToDateChange = (date) => {
    setToDate(date);
  };

  const handleChosenKindsChange = (kinds) => {
    const res = kinds.map(kind => kind.label);
    // formik.values.kinds = res;
    formik.setFieldValue('kinds', res, true); 
    setChosenKinds(JSON.stringify(res));
  };

  const handleBudgetSelection = (selectedBudget) => {
    // formik.values.budget = selectedBudget;
    formik.setFieldValue('budget', selectedBudget, true); 
    setBudget(selectedBudget);
  };

  const handlePlacesPerDaySelection = (selectedPlacesPerDay) => {
    // formik.values.placesPerDay = selectedPlacesPerDay;
    formik.setFieldValue('placesPerDay', selectedPlacesPerDay, true); 
    setPlacesPerDay(selectedPlacesPerDay);
  };

  const validateSchema = Yup.object({
    country: Yup.number().required("Country is required!"),
    state: Yup.number().required("State is required!"),
    city: Yup.string().required("City is required!"),
    kinds: Yup.array().min(1, "Choose at least 1 kind!"),
    placesPerDay: Yup.string().required("Choose one of the options!"),
    budget: Yup.string().required("Choose budget type! It's required!"),
  });

  const formik = useFormik({
    initialValues: {
      country: "",
      state: "",
      city: "",
      fromDate: null,
      toDate: null,
      kinds: [],
      placesPerDay: "",
      budget: ""
    },
    validationSchema: validateSchema,
    onSubmit: (values, { resetForm }) => {
      // console.log(values);
      setTimeout(() => {
        console.log(fromDate.toISOString());
        const fromDateStr = JSON.stringify(fromDate);
        const toDateStr = JSON.stringify(toDate);
        // console.log(fromDateStr, toDateStr, chosenKinds);
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
            // console.log(response.data);
          })
          .catch(error => {
            // Handle error
            console.error('Error:', error);
          });
        // jump to next page
        // navigate('/map', { replace: true });  
        navigate(`/map?city=${encodeURIComponent(JSON.stringify(data))}`);
        setSubmitting(false);
        resetForm();
      }, 400);
    }
  });


  return (
    <div className="form-container">
      <form onSubmit={formik.handleSubmit}>
        <div className="form-section">
        <h6 style={{ color: formik.touched.country && formik.errors.country ? 'red' : 'inherit' }}>
          {formik.touched.country && formik.errors.country ? formik.errors.country : "Country"}
        </h6>
          <CountrySelect
            onChange={handleCountryChange}
            placeHolder="Select Country"
            onBlur={formik.handleBlur}
          />
        </div>
        <div className="form-section">
        <h6 style={{ color: formik.touched.state && formik.errors.state ? 'red' : 'inherit' }}>
          {formik.touched.state && formik.errors.state ? formik.errors.state : "State"}
        </h6>
          <StateSelect
            countryid={countryid}
            onChange={handleStateChange}
            placeHolder="Select State"
            onBlur={formik.handleBlur}
          />
        </div>
        <div className="form-section">
        <h6 style={{ color: formik.touched.city && formik.errors.city ? 'red' : 'inherit' }}>
          {formik.touched.city && formik.errors.city ? formik.errors.city : "City"}
        </h6>
          <CitySelect
            countryid={countryid}
            stateid={stateid}
            onChange={handleCityChange}
            placeHolder="Select City"
            onBlur={formik.handleBlur}
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
            {/* <Field type="hidden" name="fromDate" value={fromDate} /> */}
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
              maxDate={new Date(fromDate.getTime() + 9 * 24 * 60 * 60 * 1000)}
              placeholderText="Select To Date"
            />
            {/* <Field type="hidden" name="toDate" value={toDate} />
            <ErrorMessage name="toDate" component="div" /> */}
          </div>
        </div>
        <div className="form-section">
          <h6 style={{ color: formik.touched.kinds && formik.errors.kinds ? 'red' : 'inherit' }}>
            {formik.touched.kinds && formik.errors.kinds ? formik.errors.kinds : "Select the kind of activities you want to do"}
          </h6>
          <Select
            name='select'
            options={kinds}
            multi
            onChange={handleChosenKindsChange}
            onBlur={formik.handleBlur}
          />
        </div>
        <div className="form-section">
          <h6 style={{ color: formik.touched.placesPerDay && formik.errors.placesPerDay ? 'red' : 'inherit' }}>
            {formik.touched.placesPerDay && formik.errors.placesPerDay ? formik.errors.placesPerDay : "Number of places per day"}
          </h6>
          <div className="button-group">
            <button
              type="button"
              className={placesPerDay === "1-2" ? "selected" : ""}
              onClick={() => handlePlacesPerDaySelection("1-2")}
              onBlur={formik.handleBlur}
            >
              1-2
            </button>
            <button
              type="button"
              className={placesPerDay === "3-4" ? "selected" : ""}
              onClick={() => handlePlacesPerDaySelection("3-4")}
              onBlur={formik.handleBlur}
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
        <h6 style={{ color: formik.touched.budget && formik.errors.budget ? 'red' : 'inherit' }}>
          {formik.touched.budget && formik.errors.budget ? formik.errors.budget : "Budget"}
        </h6>
          <div className="button-group">
            <button
              type="button"
              className={budget === "cheap" ? "selected" : ""}
              onClick={() => handleBudgetSelection("cheap")}
              onBlur={formik.handleBlur}
            >
              Cheap
            </button>
            <button
              type="button"
              className={budget === "normal" ? "selected" : ""}
              onClick={() => handleBudgetSelection("normal")}
              onBlur={formik.handleBlur}
            >
              Normal
            </button>
            <button
              type="button"
              className={budget === "gold card" ? "selected" : ""}
              onClick={() => handleBudgetSelection("gold card")}
              onBlur={formik.handleBlur}

            >
              Gold Card
            </button>
          </div>
        </div>
        <button type="submit" disabled={isSubmitting}>
          Submit
        </button>
      </form>
    </div>
  );
}

export default MyForm;