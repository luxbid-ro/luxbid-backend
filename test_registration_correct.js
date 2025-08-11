// Test cu valorile acceptate de backend
const testData = {
  email: "test" + Date.now() + "@example.com",
  password: "***REMOVED***!",
  personType: "FIZICA",  // Folosesc FIZICA în loc de fizica
  firstName: "Test",
  lastName: "User",
  phone: "0700000000", 
  address: "Strada Test 123",
  city: "București",
  county: "București",
  postalCode: "010101",
  country: "România"
};

fetch("https://luxbid-backend.onrender.com/auth/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log("Status:", response.status);
  return response.text();
})
.then(data => {
  console.log("Response:", data);
})
.catch(error => {
  console.error("Error:", error);
});
