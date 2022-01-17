function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    let reqbody = {
        username,
        password
    }

    const request = new XMLHttpRequest();
    request.onreadystatechange = () => {
        if (request.readyState == 4 && request.status == 200) {
            alert("loggedin");
            window.location.href = `http://localhost:3000`;
        }else if (request.status.toString().startsWith("4")){
            alert("No such username!!!");
            document.getElementById("username").value = "";
            document.getElementById("password").value = "";
        }
    };
    request.open("POST", `http://localhost:3000/login`, false);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(reqbody));
}
















