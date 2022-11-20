
interface Product {
    id: number;
    type: 'one_charge' | 'subscription';
    name: string;
    amount: number;
    currency: string;
    sort_order: number;
    frequency?: 'monthly' | 'annual'
}

interface GeoIp {
    country_name: string;
}

interface State {
    selectedProductId?: number;
    qty?: number,
    products: Product[];
    geoIp?: GeoIp;
}

const AppState: State = {
    selectedProductId: undefined,
    qty: undefined,
    products: [],
    geoIp: undefined
}

async function renderApp(selector: string) {
    const rootElement = document.querySelector(selector)

    if (!rootElement) {
        throw new Error('App root element not found')
    }

    await fetchData();

    rootElement.innerHTML = '';
    rootElement.appendChild(renderForm())

    updateTotal()
}

async function fetchData() {
    await Promise.all([
        getProducts(),
        getGeoIp()
    ])
}

function renderForm(): Element {
    const formElement = document.createElement('form')
    formElement.className = 'order-form'

    formElement.appendChild(renderProductOptions())
    formElement.appendChild(renderInput())
    formElement.appendChild(renderTotal())
    formElement.appendChild(renderSubmitBtn())

    return formElement
}

function formatPrice(value: number, currency: string): string {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    });

    return formatter.format(value)
}

function renderProductOptions() {
    const productSelectElement = document.createElement('select')
    productSelectElement.className = 'product-select'

    productSelectElement.onchange = () => {
        AppState.selectedProductId = parseInt(productSelectElement.value)
        updateTotal()
    }

    for (let product of AppState.products) {
        const option = document.createElement('option')
        option.innerText = `${product.name} - ${formatPrice(product.amount, product.currency)}`;
        option.value = product.id.toString();
        productSelectElement.appendChild(option)
    }

    // Default select for product
    if (AppState.products.length) {
        AppState.selectedProductId = AppState.products[0].id
    }

    return productSelectElement
}

function renderInput() {
    const el = document.createElement('input')
    el.type = 'number'

    el.oninput = () => {
        const value = parseInt(el.value)
        AppState.qty = value
        updateTotal()
    }

    return el
}

function renderTotal() {
    const el = document.createElement('p')
    el.className = 'order-total'
    el.id = 'order-total'
    el.innerText = 'Total:'

    return el
}

function updateTotal() {
    const el = document.getElementById('order-total')
    const selectedProduct = AppState.products.find(o => o.id === AppState.selectedProductId)

    if (el && selectedProduct) {
        const value = formatPrice(selectedProduct.amount * (AppState.qty || 0), selectedProduct.currency)
        el.innerHTML = `Total: ${value}`
    }
}

function renderSubmitBtn() {
    const el = document.createElement('button')
    el.innerText = 'Submit'

    el.onclick = (e) => {
        e.preventDefault()
        onSubmit()
    }

    return el
}

async function onSubmit() {
    if (!AppState.qty) {
        alert('Please enter quantity')
        return
    }

    try {
        await fetch('https://depositfix.mocklab.io/order', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ productId: AppState.selectedProductId, quantity: AppState.qty, userCountry: AppState.geoIp?.country_name, candidateName: 'Hoang Nguyen' })
        })

        alert('Order sumbbited')

    } catch (e) {
        console.log(e)
        alert('Error occured')
    }
}

async function getProducts() {
    const products = await (await fetch('https://depositfix.mocklab.io/products')).json();
    AppState.products = products
}

async function getGeoIp() {
    const geoIp = await (await fetch('https://json.geoiplookup.io/api')).json();
    AppState.geoIp = geoIp
}

renderApp('#root')