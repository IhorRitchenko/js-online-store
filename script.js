const wrapper = document.querySelector('.wrapper');
let products = [];
let search = document.getElementById('search');
let cart = JSON.parse(localStorage.getItem('cart')) || {};
let openCart = document.getElementById('open-cart');
let cartSection = document.querySelector('.cart')
let counter = document.getElementById('counter');
let priceOfCart = document.getElementById('priceOfCart');
let value = 0;
let select = document.getElementById('filter');
let sort = document.getElementById('sort');

let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'default';

let items = document.querySelector('.items');
let listHtml = '';

openCart.addEventListener('click', function() {
    cartSection.classList.add('open');
    items.scrollTop = -100000;
    document.body.style.overflow = 'hidden';
})

cartSection.addEventListener('click', function(event) {
    if (event.target == cartSection) {
        cartSection.classList.remove('open');
        document.body.style.overflow = '';
    }
})

sort.addEventListener('change', function() {
    currentSort = sort.value;
    console.log(currentSort)
    filterAll()
})

search.addEventListener('input', function() {
    // renderProducts(products.filter(item => item.title.toLowerCase().includes(search.value.toLowerCase())))
    currentSearch = search.value.toLowerCase();
    filterAll()
})

select.addEventListener('change', function() {
    if (select.value == 'all') {
        // renderProducts(products)
        currentCategory = 'all'
    } else {
        currentCategory = select.value;
        // renderProducts(products.filter(item => item.category === select.value))
    }
    filterAll()
})

function filterAll() {
    let result = [...products];

    if (currentSort == 'cheap') {
        result = result.sort((a, b) => a.price - b.price);
    }

    if (currentSort == 'expensive') {
        result = result.sort((a, b) => b.price - a.price);
    }
    
    if (currentCategory != 'all') {
        result = result.filter(item => item.category == currentCategory);
    }

    if (currentSearch != '') {
        result = result.filter(item => item.title.toLowerCase().includes(currentSearch))
    }

    renderProducts(result)
}

async function fetchProducts() {
    try {
        let response = await fetch('https://fakestoreapi.com/products');
        products = await response.json();
        console.log("Got items:", products);
        renderProducts(products)
    } catch (error) {
        console.log("Error:", error);
    }

    reloadCard();
    renderCart()
}

fetchProducts();

function renderProducts(list) {
    wrapper.innerHTML = list.map(item => 
        `<div class='card'>
            <img src=${item.image}></img>
            <h3>${item.title}</h3>
            <div class="item-value">
                <div class='item-price'>${item.price} $</div>
                <button data-id='${item.id}'>Buy</button>
            </div>
        </div>`
    ).join('')
}


wrapper.addEventListener('click', (event) => {
    if (event.target.closest('button')) {
        let id = event.target.dataset.id;
        if (cart[id]) {
            cart[id] += 1;
        } else {
            cart[id] = 1
        }
        console.log(cart)
        reloadCard();
    }
    renderCart();
    saveCart();
})

function reloadCard() {
    let tempTotalItems = 0;
    let tempTotalPrice = 0;


    for (let id in cart) {
        let quantity = cart[id];
        let product = products.find(item => item.id == id);
        
        if (product) {
            tempTotalItems += quantity;
            tempTotalPrice += product.price * quantity;
        }
    }

    counter.innerHTML = tempTotalItems;
    priceOfCart.innerHTML = tempTotalPrice.toFixed(2);
}

function renderCart() {
    items.innerHTML = '';
    if (Object.keys(cart).length === 0) {
        items.innerHTML = 'Empty';
        return;
    }
    listHtml = Object.keys(cart);
    console.log(listHtml);
        
    let filterreed = listHtml.map(item => products.find(i => i.id == item));
    console.log(filterreed);
        
    items.innerHTML += filterreed.map(item => `<div class='cart-item'>
        <img src=${item.image}></img>
        <h3>${item.title}</h3>
        <div class='cart-item-price'>${item.price} $</div>
            <div class='cart-info'>
                <div class='count'>${cart[item.id]}</div>
                <button data-id='${item.id}'>X</button>
            </div>      
        </div>`).join('');
        console.log(cart);
    items.innerHTML += `<div class='buy-btn'>Buy</div>`
}

items.addEventListener('click', function(event) {
    if (event.target.closest('button')) {
        let id = event.target.dataset.id;
        delete cart[id];
        renderCart();
        reloadCard();
    }
    saveCart();
})

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

cartSection.addEventListener('click', function(event) {
    if (event.target.classList.contains('buy-btn')) {
    alert('Thank you for your purchase! Order is processing...');
    cart = {};
    localStorage.removeItem('cart');
    renderCart();
    reloadCard();
    cartSection.classList.remove('open');
    document.body.style.overflow = '';
    }
});
