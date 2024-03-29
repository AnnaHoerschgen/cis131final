/*
    Name: Anna Hoerschgen
    Date: 12/4/2022
*/

var total = 0;
var aTotal = 0;
var cTotal = 0;
var movs = 0;

//content class to keep information organized
class content {
    constructor(title, ogTitle, desc, image, adult, id) {
        this.title = title; //title
        this.ogTitle = ogTitle; //title in original language
        this.desc = desc; //description
        this.image = `${image}`; //image source
        this.adult = adult; //is the movie Adult rated?
        this.id = `${id}`; //id
    }
}

//ticket class to also keep information organized
class ticket {
    constructor(title, adult, id, key) {
        this.title = title; //title of movie
        this.adult = adult;
        if (adult == true) {
            this.price = 6.99; //price of adult tickets
        } else {
            this.price = 3.99; //price of children's tickets
        }
        this.id = id;
        this.key = key;
    }
}

//contentcard component
Vue.component('contentcard', {
    template: `
    <div class="moviecard">
        <img v-bind:src=postersrc>
        <h2>{{movtitle}}</h2>
        <div class="description">
            <div class="details">
                <h3>{{ogtitle}}</h3>
                <p>{{desc}}</p>
            </div>
        </div>
        <div class="ticbutton">
            <button @click="addAdult(movid, movtitle)">
                <p>Add Adult Ticket</p>
            </button>
            <button @click="addChild(movid, movtitle)">
                <p>Add Child Ticket</p>
            </button>
        </div>
        <input readonly type="number" v-bind:placeholder=movid>
    </div>
    `,
    props: ["movtitle", "ogtitle", "postersrc", "desc", "movid"],
    //movtitle: movie title | ogtitle: movie title in the original release language | postersrc: image source for the poster | desc: movie overview
    data() {
        return {
            amountAdult: 0,
            amountChild: 0,
            id: "",
        }
    },
    methods: {
        addAdult(id, title) {
            console.log(`id: ${id}\ntitle: ${title}`);
            this.amountAdult++;
            app.addToCart(id, title, true);
            console.log(this.amountAdult);
        },
        addChild(id, title) {
            console.log(`id: ${id}\ntitle: ${title}`);
            this.amountChild++;
            app.addToCart(id, title, false);
            console.log(this.amountChild);
        },
    }
})

//ticket component
Vue.component('ticket', {
    template: `
    <tbody class="ticket">
        <tr>
            <th class="first">Movie</th>
            <th class="second">Tickets</th>
            <th class="first">Subtotal</th>
            <th class="second"></th>
        </tr>
        <tr>
            <td id="title" class="first">{{movtitle}}</td>
            <td class="second">
                <p>Adults $6.99/ea | current amt: {{amountAdult}}</p>
                <p>Children $3.99/ea | current amt: {{amountChild}}</p>
            </td>
            <td class="first"><p v-bind:id="movid">\${{(amountAdult * 6.99) + (amountChild * 3.99)}}</p>
            <td class="second"><button @click=remove(key)>Remove</button></td>
            <br>
        </tr>
    </tbody>
    `,
    props: ["movtitle", "movid", "key"],
    //movtitle: movie title | a-id: adult ticket id | c-id: children's ticket id | movid: movie id
    methods: {
        remove() {
            this.$emit('updateRefCartAry');
        },
    },
    data() {
        return {
            amountAdult: 0,
            amountChild: 0,
        }
    }
})

//tickAry is not defined within this component -Erica
Vue.component('shop', {
    template: `
    <tbody id="shop">
        <tr>
            <th>Adult Subtotal:</th>
            <td><p>\${{aTotal}}</p></td>
        </tr>
        <tr>
            <th>Child Subtotal:</th>
            <td><p>\${{cTotal}}</p></td>
        </tr>
        <tr>
            <th>Total:</th>
            <td><p>\${{total}}</p></td>
            <td><button id="checkOut">Check Out</button></td>
        </tr>
    </tbody>
    `,
    data() {
        cartAry: [] //array of items in cart
        return {
            aTotal: 0,
            cTotal: 0,
            total: 0,
        }
    },
    methods: {
        addTicket(id, title, type) {
            console.log(`id: ${id}\ntitle: ${title}\ntype: ${type}`);
            var key = "";
            for (i = 0; i < 6; i++) {
                var keyTemp = Math.floor(Math.random * 10);
                key += `${keyTemp}`;
            }
            var newTicket = new ticket(title, type, id, key);
            console.log(newTicket);
            this.cartAry.push(newTicket);
            this.update();
            this.updateRefCartAry();
        },
        checkAdult(ticket) {
            return ticket.adult;
        },
        checkChild(ticket) {
            return !ticket.adult;
        },
        update() {
            console.log("badge clicked");

            var adultTickets = this.cartAry.filter(this.checkAdult);
            if (adultTickets.length > 0) {
                var adultPrice = adultTickets[0].price; // why is it adultTickets[0] and not adultTickets[i]? -Erica
            } else {
                var adultPrice = 0;
            }
            var childTickets = app.tickAry.filter(this.checkChild);
            if (childTickets.length > 0) {
                var childPrice = childTickets[0].price;
            } else {
                var childPrice = 0;
            }

            this.aTotal = adultPrice * adultTickets.length;
            this.cTotal = childPrice * childTickets.length;
            this.total = this.aTotal + this.cTotal;
        },
        updateRefCartAry() {
            if (app.refCartAry.length != 0) {
                app.refCartAry.reduce();
                app.refCartAry.pop();
            }
            for (i = 0; i < this.cartAry.length; i++) {
                console.log(this.cartAry[i]);
                app.refCartAry.push(this.cartAry[i]);
            }
        },
    }
})

//app
const app = new Vue({
    el: "#app",
    data: {
        title: "Movies and TV",
        movObj: { //the movie object
            message: "placeholder"
        },
        movAry: [], //array to keep movies in
        refCartAry: [],
    },
    methods: {
        //populates movAry with information from the API
        getPopular() {
            //endpoint
            var endpoint = "https://api.themoviedb.org/3/movie/popular?api_key=70ef7c62eee1244489c96681175a2a0f&language=en-US&page=1";
            //XMLHttpRequest
            var request = new XMLHttpRequest;
            request.open("get", endpoint);
            request.send();
            request.onreadystatechange = function() { //anonymous functions work exceedingly well in this situation
                //check to see if the API is responding
                if (request.readyState == 4 && request.status) {
                    //the api is responding
                    app.movAry = []; //clear movAry of any error entries
                    console.log(request);
                    var response = request.responseText;
                    console.log(response); //log response
                    this.movObj = JSON.parse(response);
                    console.log(this.movObj); //log movObj to see it

                    var leng = this.movObj.results.length; //extract movObj's length property
                    movs = leng;
                    for (i = 0; i < 3; i++) {
                        console.log(`Item ${i + 1} of ${leng}`); //keeps track of how many times this block has looped
                        var info = [this.movObj.results[i].title, this.movObj.results[i].original_title, this.movObj.results[i].overview, `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${this.movObj.results[i].poster_path}`, this.movObj.results[i].adult]; //extracts the necessary information from movObj
                        var temp = new content(info[0], info[1], info[2], info[3], info[4], this.movObj.results[i].id); //temp variable for brevity
                        app.movAry.push(temp); //pushes temp to movAry
                        console.log(app.movAry[i]); //ensure that the data was pushed
                    }
                } else { //in case the API is not responding
                    var temp = new content(`Error ${request.status}`, `${request.statusText}`, "errPoster.png")
                    app.movAry.push(temp);
                }
            }
        },
        //purchase function
        purchase() {
            var putHere = document.getElementById("bottomText");
            putHere.innerHTML = "Tickets purchased.";
        },
        addToCart(id, title, type) {
            console.log(`id: ${id}\ntitle: ${title}\ntype: ${type}`);
        }
    }
})

//call the getPopular() method in app
app.getPopular();

//add eventlistener to the checkout
document.getElementById("checkOut").addEventListener("click", function() {
    app.purchase();
});