const icons={
    redIcon : L.icon({
        iconUrl: './assets/redmarker.svg',
    
        iconSize:     [50, 95],
        iconAnchor:   [22, 94],
        popupAnchor:  [3, -76]
    }),

    blueIcon : L.icon({
        iconUrl: './assets/bluemarker.svg',
    
        iconSize:     [50, 95],
        iconAnchor:   [22, 94],
        popupAnchor:  [3, -76]
    })
}

class Mapclass{
    constructor(){
        this.map=null;
        this.currenCoords=[0,0];
        this.placeArray=[];
        this.initMap();
        this.marker=null;
        this.currentButton=null;
    }

    initEventlistner(){
        document.querySelector('.btn--locator').addEventListener('click',(event)=>{
            this.resetMap();
        })

        document.querySelector('.sidebar').addEventListener('click',(event)=>{
            // console.log(event.target.closest('button'));
            
            if(event.target.closest('button')&&event.target.closest('button').getAttribute('data-popup')){
                const element=document.querySelector(event.target.closest('button').getAttribute('data-popup'));
                // element.classList.toggle('active');
                element.style.display==='none'?'flex':'none';
                console.log(element);
            }
        })
    }

    initMap(){
        navigator.geolocation.getCurrentPosition((position)=>{
            this.currenCoords=[position.coords.latitude,position.coords.longitude];
            this.map = L.map('map').setView([this.currenCoords[0], this.currenCoords[1]], 18);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(this.map);
            L.Control.geocoder().addTo(this.map);
            L.marker([this.currenCoords[0], this.currenCoords[1]], {icon: icons.redIcon}).addTo(this.map).bindPopup(`You are here.`);
            // L.marker([this.currenCoords[0],this.currenCoords[1]], {icon: icons.blueIcon}).addTo(this.map).bindPopup(item.placename);
            // L.Routing.control({
            //     waypoints: [
            //         L.latLng(57.74, 11.94),
            //         L.latLng(57.6792, 11.949)
            //     ],
            //     routeWhileDragging: true
            // }).addTo(this.map);

            this.map.on('click',(event)=>{
                console.log(event);
                if(this.marker){
                    this.map.removeLayer(this.marker);
                    this.marker=null;
                }
                else{
                    this.marker=new L.marker([event.latlng.lat, event.latlng.lng], {icon: icons.blueIcon}).addTo(this.map).bindPopup(`<button data-latlng=${JSON.stringify([event.latlng.lat,event.latlng.lng])} class="btn--direction">Direction</button>`);
                }
            })
            this.fetchPlaces();
            this.initEventlistner();
        })
    }

    renderFaviouritePlaces(){
        const faviouritePlaces=this.placeArray.filter((item)=>{
            return item.faviourite;
        });

        console.log(faviouritePlaces);
        
    }

    showPlaces(){
        this.placeArray.forEach((item)=>{
            L.marker([item.latitude, item.longitude], {icon: icons.blueIcon}).addTo(this.map).bindPopup(`
                <div class="placecard">
                    <img class="placecard__image" src="${item.placeimage}" alt="${item.placename}">
                    <div class="placecard__description">
                        <h2 class="placecard__placename">${item.placename}</h2>
                        <h2 class="placecard__placestatus">Status: <span>${item.placestatus}</span></h2>
                        <h2 class="placecard__placeaddress">Address: <span>${item.placeaddress}</span></h2>
                    </div>
                    <div class="placecard__buttons">
                        <button data-id=${item.id} class="btn--direction">Direction</button>
                        <button data-id=${item.id} class="btn--addfaviourite ${item.faviourite?'checkedFaviourite--btn':''}"><svg class="icon--favourite ${item.faviourite?'checkedFaviourite--icon':''}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.0" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                          </svg></button>
                    </div>
                </div>
                `);
        })


        this.map.on('popupopen', (event)=>{
            console.log(event.target);
            
            document.querySelectorAll('.btn--direction').forEach((element)=>{
                console.log(element);
                
                element.addEventListener('click',(event)=>{
                    if(event.target.getAttribute('data-id')){
                        const placeItem=this.getPlace(+event.target.getAttribute('data-id'))
                        this.showRoute(this.currenCoords,[placeItem.latitude,placeItem.longitude]);
                    }
                    else{
                        const placeCoords=JSON.parse(event.target.getAttribute('data-latlng'));
                        this.showRoute(this.currenCoords,placeCoords);
                    }
                    // console.log(placeItem);
                    this.map.closePopup();
                })
            })
            
            document.querySelectorAll('.btn--addfaviourite').forEach((element)=>{
                console.log(element);
                
                element.addEventListener('click',(event)=>{
                    event.preventDefault();
                    console.log(element);
                    if(element.getAttribute('data-id')){
                        const placeItem=this.getPlace(+element.getAttribute('data-id'));
                        placeItem.faviourite=!placeItem.faviourite;
                        if(!placeItem.faviourite){
                            console.log(element);
                            
                            element.classList.remove('checkedFaviourite--btn');
                            element.querySelector('svg').classList.remove('checkedFaviourite--icon')
                        }
                        else{
                            element.classList.add('checkedFaviourite--btn');
                            element.querySelector('svg').classList.add('checkedFaviourite--icon')
                        }
                        this.updatePlace(placeItem.id,placeItem);   
                    }
                })
            })
        })
    }

    getPlace(id){
        const placeItem=this.placeArray.find((item)=>{
            return item.id==id;
        })
        return placeItem;
    }

    showRoute(fromLatLng,toLatLng){
        const layer=new L.Routing.control({
            waypoints: [
                L.latLng(fromLatLng[0], fromLatLng[1]),
                L.latLng(toLatLng[0], toLatLng[1])
            ],
            routeWhileDragging: true
        }).addTo(this.map);
        this.openPopup(document.querySelector('.close--route'));

        document.getElementsByClassName('close--route')[0].addEventListener('click',(event)=>{
            this.map.removeControl(layer);
            this.resetMap();
            this.closePopup(document.querySelector('.close--route'));
        })
    }

    async fetchPlaces(){
        let response=await fetch('http://localhost:3000/places',{
            method: 'GET',
            headers:{
                "Content-Type": "application/json"
            }
        });
        this.placeArray=await response.json();
        this.showPlaces();
    }

    async updatePlace(id,placeItem){
        let response=await fetch(`http://localhost:3000/places/${id}`,{
            method: 'PUT',
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(placeItem)
        })
        
        // console.log(response);
        
    }

    resetMap(){
        this.map.flyTo(this.currenCoords, 18);;
    }

    openPopup(element,displayProperty='flex') {
        element.style.display = displayProperty;
        document.body.style.overflow = "hidden";
    }

    closePopup(element) {
        element.style.display = "none";
        document.body.style.overflow = "";
    }
}

document.addEventListener('DOMContentLoaded',(event)=>{
    new Mapclass();
})