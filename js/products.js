const ORDER_ASC_BY_PRICE = "ASC";
const ORDER_DESC_BY_PRICE = "DESC";
const ORDER_BY_PROD_COUNT = "Cant.";
let productCategory = localStorage.getItem("catID");
let products = null;

let minCount = undefined;
let maxCount = undefined;

function buildCard(id, title, currency, price, image, description, sold) {
    return `
    <div class="row justify-content-center mt-3 mb-1" onclick="setProduct(${id})">
        <div class="col-md-12">
            <div class="card shadow-0 border rounded-3">
                <div class="card-body product">
                    <div class="row">
                        <div class="col-md-12 col-lg-3 col-xl-3 mb-4 mb-lg-0">
                            <div class="bg-image hover-zoom ripple rounded ripple-surface">
                                <img src="${image}" class="w-100">
                                <a href="#!">
                                <div class="hover-overlay">
                                    <div class="mask" style="background-color: rgba(253, 253, 253, 0.15);"></div>
                                </div>
                                </a>
                            </div>
                        </div>
                        <div class="col-md-8 col-lg-8 col-xl-8">
                            <h5>${title} - ${currency} ${price}</h5>
                            <p class="text-truncate mb-4 mb-md-0">
                                ${description}
                            </p>
                        </div>
                        <div class="col-md-1 col-lg-1 col-xl-1 border-sm-start-none">
                            <div class="d-flex flex-row align-items-left mb-1">
                                <h4 class="mb-1 me-1">${sold}</h4>
                                <p class="small">vendidos</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

function buildProducts(products) {
    document.getElementById("products-container").innerHTML = ""; 
    products.forEach(product => {
        if(isInPriceRange(product)) {
            if (matchWithSearch(product)){
                document.getElementById("products-container").innerHTML+= buildCard(product.id, product.name, product.currency, product.cost, product.image, product.description, product.soldCount);
            }
        }
    });
}

function matchWithSearch(product){
    let searchValue = document.getElementById("search").value.toLowerCase();
    if (searchValue != ""){
        return (product.name.toLowerCase().search(searchValue) != -1 || product.description.toLowerCase().search(searchValue) != -1);
    }
    return true;
}

function getProductsAndShow() {
    fetch(`https://japceibal.github.io/emercado-api/cats_products/${productCategory}.json`)
.then(response => response.json())
.then(function(data) {
        document.getElementById("category-title").innerText=data.catName;
        products = data.products;
        buildProducts(data.products);
    });
}

function sortProduct(criteria, array){
    let result = [];
    if (criteria === ORDER_ASC_BY_PRICE){
        result = array.sort(function(a, b) {
            if ( a.cost < b.cost ){ return -1; }
            if ( a.cost > b.cost ){ return 1; }
            return 0;
        });
    }else if (criteria === ORDER_DESC_BY_PRICE){
        result = array.sort(function(a, b) {
            if ( a.cost > b.cost ){ return -1; }
            if ( a.cost < b.cost ){ return 1; }
            return 0;
        });
    }else if (criteria === ORDER_BY_PROD_COUNT){
        result = array.sort(function(a, b) {
            let aCount = parseInt(a.soldCount);
            let bCount = parseInt(b.soldCount);

            if ( aCount > bCount ){ return -1; }
            if ( aCount < bCount ){ return 1; }
            return 0;
        });
    }

    return result;
}

function setCatID(id) {
    localStorage.setItem("catID", id);
    window.location = "products.html"
}

function setProduct (id){
    localStorage.setItem("productId", id);
    window.location = "product-info.html"
}

function isInPriceRange(product){
    return (((minCount == undefined) || (minCount != undefined && parseInt(product.cost) >= minCount)) &&
((maxCount == undefined) || (maxCount != undefined && parseInt(product.cost) <= maxCount)));
}

function sort(sortCriteria){
    currentSortCriteria = sortCriteria;
    products = sortProduct(currentSortCriteria, products);
    buildProducts(products);
}

document.addEventListener("DOMContentLoaded", function(e){
    getProductsAndShow();

    document.getElementById("sortAsc").addEventListener("click", function(){
        sort(ORDER_ASC_BY_PRICE);
    });

    document.getElementById("sortDesc").addEventListener("click", function(){
        sort(ORDER_DESC_BY_PRICE);
    });

    document.getElementById("sortByCount").addEventListener("click", function(){
        sort(ORDER_BY_PROD_COUNT);
    });

    document.getElementById("clearRangeFilter").addEventListener("click", function(){
        document.getElementById("rangeFilterCountMin").value = "";
        document.getElementById("rangeFilterCountMax").value = "";

        minCount = undefined;
        maxCount = undefined;
        
        getProductsAndShow();
    });

    document.getElementById("rangeFilterCount").addEventListener("click", function(){
        minCount = document.getElementById("rangeFilterCountMin").value;
        maxCount = document.getElementById("rangeFilterCountMax").value;

        if ((minCount != undefined) && (minCount != "") && (parseInt(minCount)) >= 0){
            minCount = parseInt(minCount);
        }
        else{
            minCount = undefined;
        }

        if ((maxCount != undefined) && (maxCount != "") && (parseInt(maxCount)) >= 0){
            maxCount = parseInt(maxCount);
        }
        else{
            maxCount = undefined;
        }

        buildProducts(products);
    });

    document.getElementById("search").addEventListener("input", function(){
        buildProducts(products);
    });
});
