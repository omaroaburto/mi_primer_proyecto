let mealsState = []
let ruta = 'login'
let user = []

const StringToHTML = (s) => {
    const parse = new DOMParser()
    const doc = parse.parseFromString(s, 'text/html')
    return doc.body.firstChild
}

const renderItems = (item) => {
    const element = StringToHTML(`<li data-id="${item._id}">${item.name}</li>`)

    element.addEventListener('click', () => {
        const mealsList = document.getElementById('meals-list')
        Array.from(mealsList.children).forEach(x => x.classList.remove('selected'))
        element.classList.add('selected')
        const mealsIdInput = document.getElementById('meals-id')
        mealsIdInput.value = item._id      
    })
    return element
}

const renderOrders = (order, meals) => {
    const meal = meals.find(meal => meal._id === order.meal_id)
    const element = StringToHTML(`<li data-id="${order._id}"> ${meal.name} - ${order.user_id}</li>`)  
    return element
}

const inicializaFormulario = (token) => {

    const orderForm = document.getElementById('order')
    orderForm.onsubmit = (e) =>{
        e.preventDefault()
        const submit = document.getElementById('submit')
        submit.setAttribute('disabled', true)
        const mealId = document.getElementById('meals-id')
        const mealIdValue = mealId.value

        if(!mealIdValue){
            submit.removeAttribute('disabled')
            alert('Seleccione un plato')
            return
        }

        const order = {
            meal_id: mealIdValue,
            user_id: user._id,
        }
        console.log(order)
        fetch('https://serverless-8h142owsi.vercel.app/api/orders',{
            method: 'POST',
            headers:{
                'Content-Type':'application/json', 
                authorization: token
            },
            body: JSON.stringify(order)
        }).then(x => x.json())
          .then(respuesta => {
            const renderedOrder = renderOrders(respuesta, mealsState)
            const ordersList =  document.getElementById('orders-list')
            ordersList.appendChild(renderedOrder)
            submit.removeAttribute('disabled')
           })
           .catch( e => console.log(e))
    }

}

const inicializaDatos = () => {
    fetch('https://serverless-8h142owsi.vercel.app/api/meals')
    .then(response => response.json())
    .then(data => {
        mealsState = data
        const mealsList = document.getElementById('meals-list')
        const submit = document.getElementById('submit')
        const listItems = data.map(renderItems)
        mealsList.removeChild(mealsList.firstElementChild)
        listItems.forEach(element => mealsList.appendChild(element)) 
        submit.removeAttribute('disabled')
        fetch('https://serverless-8h142owsi.vercel.app/api/orders')
        .then(response => response.json())
        .then(ordersData => {
            const ordersList = document.getElementById('orders-list')
            const listOrders = ordersData.map(orderData => renderOrders(orderData, data))
            ordersList.removeChild(ordersList.firstElementChild)
            listOrders.forEach(element => ordersList.appendChild(element))
        })
    })
}

const renderApp = () => {
    const token = localStorage.getItem('token')
    if(token){
        user = JSON.parse(localStorage.getItem('user'))
        return renderedOrders(token)
    }
    renderLogin()
}

const renderedOrders = (token) => {
    const ordersView = document.getElementById('orders-view')
    document.getElementById('app').innerHTML = ordersView.innerHTML
    inicializaFormulario(token)
    inicializaDatos()
}

const renderLogin = () => {
    const loginTemplate = document.getElementById('login-template') 
    document.getElementById('app').innerHTML = loginTemplate.innerHTML

    const loginForm = document.getElementById('login-form')
    loginForm.onsubmit = (e) => {
        e.preventDefault()
        const email = document.getElementById('username').value
        const password = document.getElementById('password').value

        fetch('https://serverless.oaburto.vercel.app/api/auth/login',  {
            method: 'POST',
            headers: {
                'Content-Type':'application/json',
            },
            body: JSON.stringify({ email, password })
        }).then(x => x.json())
        .then(respuesta => {
            localStorage.setItem('token', respuesta.token)
            ruta = 'orders'
            return respuesta.token 
        }).then(token => {
            return fetch('https://serverless-8h142owsi.vercel.app/api/auth/me', {
                method: 'GET',
                headers: {
                    'Content-Types' : 'application/json',
                    authorization: token,
                },

            })
        })
        .then(x => x.json())
        .then(fetchedUser => {
            localStorage.setItem('user', JSON.stringify(fetchedUser))
            user = fetchedUser
            renderedOrders(token)
        })
    }
}

window.onload = () => {
    renderApp()   
}