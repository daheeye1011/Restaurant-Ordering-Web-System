function register() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    let reqbody = {
        username,
        password
    }

    const request = new XMLHttpRequest();
    request.onreadystatechange = () => {
        if (request.readyState == 4 && request.status == 200) {
            let userId = request.response;
            alert("Register");
            window.location = `http://localhost:3000/user/${userId}`;
        }else if (request.status.toString().startsWith("4")){
            alert("Username has already taken!!!");
            document.getElementById("username").value = "";
            document.getElementById("password").value = "";
        }
    };
    request.open("POST", `http://localhost:3000/registration`, false);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(reqbody));
}





