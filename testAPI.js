fetch("http://localhost:5000/api/tests/all")
  .then(res => res.text())
  .then(text => console.log("Response:", text))
  .catch(err => console.error("Error:", err));
