const inquirer = require("inquirer");
const mysql = require("mysql");
const logo = require("asciiart-logo");
const { builtinModules } = require("module");



module.exports = function(connection) {

    const myLogo = logo({ name: "Manage your employees" }).render();
    console.log(myLogo)

    


    function init() {
        
        inquirer.prompt ([

            {
                name: 'crud',
                type: 'list',
                message: 'What would you like to do with your departments, roles, or employees?',
                choices: ['Add', 'View', 'Update']
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
            else {
                console.log("Something went wrong.")
            }
        })
    }

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
                    connection.query(
                        "INSERT INTO department SET ?",
                        {
                        name: result.deptName,
                        },
                        function(err) {
                        if (err) throw err;
                        console.log("Your department was created successfully!");
                        init();
                        }
                    )
                })
                    
                
            }
            else if (result.specify == 'Add roles') {

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
                                    var choiceArray = [];
                                    if (err) throw err;
                                    for (var i = 0; i < results.length; i++) {
                                        choiceArray.push(results[i].name + ": " + results[i].id);
                                        console.log(choiceArray)
                                    }
                                    return choiceArray;   
                            }
                            
                    
                        },
                    ]).then((result) => {
                        console.log(result.department_id)
                        connection.query(
                            "INSERT INTO role SET ?",
                            {
                            title: result.title,
                            salary: result.salary,
                            department_id: result.department_id
                            },
                            function(err) {
                            if (err) throw err;
                            console.log("Your department was created successfully!");
                            init();
                            }
                        )
                    })
                })
            }
            else if (result.specify == 'Add employees') {
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
                        type: 'input',
                        message: "What is the employee's role ID?"
                    },
                    {
                        name: 'manager_id',
                        type: 'input',
                        message: "What is the employee's manager's ID (Leave blank if this doesn't apply)?"
                    }
                ]).then((result) => {
                    connection.query(
                        "INSERT INTO employee SET ?",
                        {
                            first_name: result.first_name,
                            last_name: result.last_name,
                            role_id: result.role_id,
                            manager_id: result.manager_id || null,
                        },
                        function(err) {
                        if (err) throw err;
                        console.log("Your employee was created successfully!");
                        init();
                        }
                    )
                })
            }
            else {
                console.log("Something went wrong.")
            }
        })
    }

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
                    console.table(data);
                    init();
                    }
                )                
            }
            else if (result.specify == 'View roles') {
                
                connection.query("SELECT * FROM role", function(err, data) {
                    if (err) throw err;
                    console.table(data);
                    init();
                    }
                ) 
            }
            else if (result.specify == 'View employees') {
                connection.query("SELECT * FROM employee", function(err, data) {
                    if (err) throw err;
                    console.table(data);
                    init();
                    }
                ) 
            }
            else {
                console.log("Something went wrong.")
            }
        })

    }
    
    function update() {

        connection.query("SELECT * FROM role", function(err, results) {
            if (err) throw err;
            inquirer.prompt ([
                {
                    name: 'specify',
                    type:'rawlist',
                    message: 'What role would you like to update?',
                    choices: function() {
                        var choiceArray = [];
                        for (var i = 0; i < results.length; i++) {
                            choiceArray.push(results[i].title);
                        }
                        return choiceArray;
                    }
                },
                {
                    name: 'title',
                    type: 'input',
                    message: "What is the role's updated title?"
                },

                {
                    name: 'salary',
                    type: 'input',
                    message: "What is the role's updated salary?"
                },
                {
                    name: 'department_id',
                    type: 'rawlist',
                    message: "What is the role's updated department ID?",
                    choices: function() {
                        var choiceArray = [];
                        connection.query('SELECT name FROM department', function(err, results){
                        for (var i = 0; i < results.length; i++) {
                            choiceArray.push(results[i].id);
                        }
                        return choiceArray;
                    })
                    }
               
                },
            ]).then((result) => {
                connection.query(
                    "UPDATE roles SET ? WHERE ?",
                    [
                      {
                        title: result.title,
                        salary: result.salary,
                        department_id: result.department_id
                      },
                      {
                        title: result.specify
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
    }

    init()

}