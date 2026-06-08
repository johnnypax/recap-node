const express = require("express");
const app = express();

app.use(express.json());

const PORT = 3000;
const HOST = "localhost";
let elenco = [
    { 
        id: 1, 
        name: "Mario Rossi", 
        role: "Developer" 
    },
    { 
        id: 2, 
        name: "Valeria Verdi", 
        role: "Developer" 
    },
    { 
        id: 3, 
        name: "Giovanni Pace", 
        role: "Developer" 
    }
];

app.listen(PORT, HOST, () => {
    console.log("Sono in ascolto");
});

//getAllEmployees
app.get("/api/employees", (req, res) => {
    res.json(elenco);
});

//getEmployeeById
app.get("/api/employees/:id", (req, res) => {
    let id = req.params.id;

    for(let i=0; i<elenco.length; i++) {
        if(elenco[i].id == id) {
            res.status(200).json(elenco[i]);
            return;
        }
    }
    res.status(404).json({ message: "Employee not found" });
});

//createEmployee
app.post("/api/employees", (req, res) => {
    const newEmployee = req.body;
    newEmployee.id = elenco.length + 1;
    elenco.push(newEmployee);
    res.status(201).json(newEmployee);
});

//deleteEmployee
app.delete("/api/employees/:id", (req, res) => {
    let id = req.params.id;

    for(let i=0; i<elenco.length; i++) {
        if(elenco[i].id == id) {
            elenco.splice(i, 1);
            res.status(200).json({ message: "Employee deleted" });
            return;
        }
    }

    res.status(404).json({ message: "Employee not found" });
});

app.put("/api/employees/:id", (req, res) => {
    let id = req.params.id;

    for(let i=0; i<elenco.length; i++) {
        if(elenco[i].id == id) {
            
            elenco[i].name = req.body.name ? req.body.name : elenco[i].name;
            elenco[i].role = req.body.role ? req.body.role : elenco[i].role;
            res.status(200).json(elenco[i]);
            return;
        }
    }
    res.status(404).json({ message: "Employee not found" });
});