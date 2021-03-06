const inquirer = require("inquirer");
const mysql = require("mysql");
const logo = require("asciiart-logo");
const { builtinModules } = require("module");



module.exports = function(connection) {

    // Creates acsciiart logo
    const myLogo = logo({ name: "Manage your employees" }).render();
    console.log(myLogo)

    

    /// Start here
    function init() {
        
        // Asks which function the user wants to use and redirects them accordingly
        inquirer.prompt ([

            {
                name: 'crud',
                type: 'list',
                message: 'What would you like to do with your departments, roles, or employees?',
                choices: ['Add', 'View', 'Update', 'Exit']
            },
        ]).then((result) => {
            if (result.crud == 'Add') {
                add();
            }
            else if (result.crud == 'View') {
                view();
            }
            else if (result.crud == 'Update') {
                update();
            }
            else if (result.crud == 'Exit') {
                connection.end();
            }
            else {
                console.log("Something went wrong.")
            }
        })
    }

    // You can select to add a department, role, or employee
    function add() {
        inquirer.prompt ([
            {
                name: 'specify',
                type: 'list',
                message: 'What would you like to add?',
                choices: ["Add departments", "Add roles", "Add employees"]
            },
        ]).then((result) => {
            if (result.specify == 'Add departments') {

                inquirer.prompt ([

                    {
                        name: 'deptName',
                        type: 'input',
                        message: "What is the name of the department you're adding?"
                    },
                ]).then((result) => {
                    // Sets the department name in the DB
                    connection.query(
                        "INSERT INTO department SET ?",
                        {
                        name: result.deptName,
                        },
                        function(err) {
                        if (err) throw err;
                        // Success throw
                        console.log("Your department was created successfully!");
                        // Back to main menu
                        init();
                        }
                    )
                })
                    
                
            }
            else if (result.specify == 'Add roles') {

                // Grabs the departments to list them in order by id
                connection.query("SELECT * FROM department ORDER BY id ASC", function(err, results){
                    inquirer.prompt ([

                        {
                            name: 'title',
                            type: 'input',
                            message: "What is the role's title?"
                        },

                        {
                            name: 'salary',
                            type: 'input',
                            message: "What is the role's salary?"
                        },
                        {
                            name: 'department_id',
                            type: 'rawlist',
                            message: "What is the role's department ID?",
                            choices: function() {
                                    // Array to push items to
                                    var choiceArray = [];
                                    if (err) throw err;
                                    // Goes over every item, pushing their name and id to the array
                                    for (var i = 0; i < results.length; i++) {
                                        choiceArray.push(results[i].name + ": " + results[i].id);
                                    }
                                    // Prints out each department to the user to choose from
                                    return choiceArray;   
                            }
                            
                    
                        },
                    ]).then((result) => {
                        newID = result.department_id
                        connection.query(
                            "INSERT INTO role SET ?",
                            {
                            title: result.title,
                            salary: result.salary,
                            department_id: newID.charAt(newID.length-1) // This grabs the last character in the string, which will always be the id
                            },
                            function(err) {
                            if (err) throw err;
                            // Success throw
                            console.log("Your role was created successfully!");
                            // Back to main menu
                            init();
                            }
                        )
                    })
                })
            }
            else if (result.specify == 'Add employees') {

                connection.query("SELECT * FROM role", function(err, results) {
                    if (err) throw err;
                // Asks for first/last name, role id and manager id to all be inserted into the DB
                    inquirer.prompt ([

                        {
                            name: 'first_name',
                            type: 'input',
                            message: "What is the employee's first name?"
                        },
                        {
                            name: 'last_name',
                            type: 'input',
                            message: "What is the employee's last name?"
                        },
                        {
                            name: 'role_id',
                            type: 'rawlist',
                            message: "What is the employee's role ID?",
                            choices: function() {
                                var choiceArray = [];
                                // Goes through all the roles in DB, pushing them to the array to be printed
                                for (var i = 0; i < results.length; i++) {
                                    choiceArray.push(results[i].title + " || ID: " + results[i].id);
                                }
                                // Sends back data to be printed for the user
                                return choiceArray;
                            }
                        },
                        {
                            name: 'manager_id',
                            type: 'input',
                            message: "What is the employee's manager's ID (Leave blank if this doesn't apply)?"
                        }
                    ]).then((result) => {
                        newID = result.role_id
                    connection.query(
                        "INSERT INTO employee SET ?",
                        {
                            first_name: result.first_name,
                            last_name: result.last_name,
                            role_id: newID.charAt(newID.length-1),
                            manager_id: result.manager_id || null,
                        },
                        function(err) {
                        if (err) throw err;
                        // Success throw
                        console.log("Your employee was created successfully!");
                        // Back to main menu
                        init();
                        }
                    )
                })
                })
            }
            // Just in case 
            else {
                console.log("Something went wrong.")
            }
        })
    }

    // Allows you to view data for each category in a table
    function view() {
        inquirer.prompt ([
            {
                name: 'specify',
                type:'list',
                message: 'What would you like to view?',
                choices: ['View departments', 'View roles', 'View employees']
            },
        ]).then((result) => {
            if (result.specify == 'View departments') {

                connection.query("SELECT * FROM department", function(err, data) {
                    if (err) throw err;
                    // Prints data in a table
                    console.table(data);
                    // Back to main menu
                    init();
                    }
                )                
            }
            else if (result.specify == 'View roles') {
                
                connection.query("SELECT * FROM role", function(err, data) {
                    if (err) throw err;
                    // Prints data in a table
                    console.table(data);
                    // Back to main menu
                    init();
                    }
                ) 
            }
            else if (result.specify == 'View employees') {
                connection.query("SELECT * FROM employee", function(err, data) {
                    if (err) throw err;
                    // Prints data in a table
                    console.table(data);
                    // Back to main menu
                    init();
                    }
                ) 
            }
            else {
                console.log("Something went wrong.")
            }
        })

    }
    
    // Lets you update an employees role
    function update() {

        connection.query("SELECT * FROM employee", function(err, data) {
            connection.query("SELECT * FROM role", function(err, results) {
                if (err) throw err;
                inquirer.prompt ([
                    {
                        name: 'specify',
                        type:'rawlist',
                        message: "What employee's role would you like to update?",
                        choices: function() {
                            var choiceArray = [];
                            // Goes through all the roles in DB, pushing them to the array to be printed
                            for (var i = 0; i < data.length; i++) {
                                choiceArray.push(data[i].first_name + " " + data[i].last_name + " || ID: " + data[i].id);
                            }
                            // Sends back data to be printed for the user
                            return choiceArray;
                        }
                    },
                    {
                        name: 'department_id',
                        type: 'rawlist',
                        message: "What should be the employee's updated role ID?",
                        choices: function() {
                            var choiceArray = [];
                            // Gets all the department ids 
                            for (var i = 0; i < results.length; i++) {
                                choiceArray.push(results[i].title + ": " + results[i].id);
                                console.log(choiceArray)
                            }
                            return choiceArray;   
                    }
                    
            
                },
                ]).then((result) => {
                    newID = result.department_id
                    employeeID = result.specify
                    connection.query(
                        "UPDATE employee SET ? WHERE ?",
                        [
                        {
                            role_id: newID.charAt(newID.length-1)
                        },
                        {
                            id: employeeID.charAt(employeeID.length-1)
                        }
                        ],
                        function(err, res) {
                        if (err) throw err;
                        console.log("Role updated!\n");
                        init();
                        }
                    )

                })
            })
        })
    }

    init()

}