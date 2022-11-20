"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const AppState = {
    selectedProduct: undefined,
    qty: undefined,
    products: [],
    geoIp: undefined
};
function renderApp(selector) {
    return __awaiter(this, void 0, void 0, function* () {
        const rootElement = document.querySelector(selector);
        if (!rootElement) {
            throw new Error('App root element not found');
        }
        yield fetchData();
        rootElement.innerHTML = '';
        rootElement.appendChild(renderForm());
        updateTotal();
    });
}
function fetchData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Promise.all([
                getProducts(),
                getGeoIp()
            ]);
        }
        catch (e) {
            alert('Error on initiate data');
            throw e;
        }
    });
}
function renderForm() {
    const formElement = document.createElement('form');
    formElement.className = 'order-form';
    formElement.appendChild(renderProductOptions());
    formElement.appendChild(renderInput());
    formElement.appendChild(renderTotal());
    formElement.appendChild(renderSubmitBtn());
    return formElement;
}
function formatPrice(value, currency) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    });
    return formatter.format(value);
}
function renderProductOptions() {
    const productSelectElement = document.createElement('select');
    productSelectElement.className = 'product-select';
    productSelectElement.onchange = () => {
        AppState.selectedProduct = AppState.products.find(o => o.id === parseInt(productSelectElement.value));
        updateTotal();
    };
    for (let product of AppState.products) {
        const option = document.createElement('option');
        option.innerText = `${product.name} - ${formatPrice(product.amount, product.currency)}`;
        option.value = product.id.toString();
        productSelectElement.appendChild(option);
    }
    // Default select for product
    if (AppState.products.length) {
        AppState.selectedProduct = AppState.products[0];
    }
    return productSelectElement;
}
function renderInput() {
    const el = document.createElement('input');
    el.type = 'number';
    el.oninput = () => {
        const value = parseInt(el.value);
        AppState.qty = value;
        updateTotal();
    };
    return el;
}
function renderTotal() {
    const el = document.createElement('p');
    el.className = 'order-total';
    el.id = 'order-total';
    el.innerText = 'Total:';
    return el;
}
function updateTotal() {
    const el = document.getElementById('order-total');
    if (el && AppState.selectedProduct) {
        const value = formatPrice(AppState.selectedProduct.amount * (AppState.qty || 0), AppState.selectedProduct.currency);
        el.innerHTML = `Total: ${value}`;
    }
}
function renderSubmitBtn() {
    const el = document.createElement('button', {});
    el.innerText = 'Submit';
    el.onclick = (e) => {
        e.preventDefault();
        onSubmit();
    };
    return el;
}
function onSubmit() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (!AppState.qty) {
            alert('Please enter quantity');
            return;
        }
        if (!AppState.selectedProduct) {
            alert('Please select a product');
            return;
        }
        try {
            yield fetch('https://depositfix.mocklab.io/order', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    productId: AppState.selectedProduct.id,
                    quantity: AppState.qty,
                    userCountry: (_a = AppState.geoIp) === null || _a === void 0 ? void 0 : _a.country_name,
                    candidateName: 'Hoang Nguyen',
                    amount: AppState.qty * AppState.selectedProduct.amount
                })
            });
            alert('Order sumbbited');
        }
        catch (e) {
            console.log(e);
            alert('Error occured');
        }
    });
}
// Use fetch for mordern browser, could be replaced with XMLHttpsRequest
function getProducts() {
    return __awaiter(this, void 0, void 0, function* () {
        const products = yield (yield fetch('https://depositfix.mocklab.io/products')).json();
        AppState.products = products;
    });
}
function getGeoIp() {
    return __awaiter(this, void 0, void 0, function* () {
        const geoIp = yield (yield fetch('https://json.geoiplookup.io/api')).json();
        AppState.geoIp = geoIp;
    });
}
renderApp('#root');
