import catName from './catlist.js';
import catApi from './catapi.js';


const api_key    = catApi;
const cookie_key = 'catnames-regu0005';
const catsLimit  = 30;
let   mform; 
let   petnames   = [];

document.addEventListener('DOMContentLoaded', () => {
    let store = localStorage.getItem(cookie_key);

    console.log(store);
    if (store === null) {
      let str = JSON.stringify(petnames);
      localStorage.setItem(cookie_key, str);
    } 
    else {
      
      let obj = JSON.parse(store);
      if (Array.isArray(obj)) {
        petnames = obj;
      } else {
        //overwrite with the default value
        localStorage.setItem(cookie_key, JSON.stringify(petnames));
      }
    }

    mform = document.getElementById('form1');
    mform.addEventListener('submit', loadImages);
    getCategories();

  });

function findID(id2)
{
    let itemsSaved = localStorage.getItem(cookie_key);
    let objSaved = JSON.parse(itemsSaved);

    let idTmp   = "";
    let nameTmp = "";
    let counterTmp = "";
    let result = "";

    if(Array.isArray(objSaved)){

        if(objSaved !== null) {
                objSaved.map( (values)=> {

                    idTmp = values.id;
                    nameTmp = values.name;
                    counterTmp = values.counter;

                    if(idTmp==id2) {
                        result = [idTmp,nameTmp,counterTmp];
                    }
                    
                } ).join('');
        };
    }

    return result;
}

function saveData(id2,name2){
        
    if(name2){
        // ADD ID and NAME to the cookie
        let val = name2.toLowerCase();
        val = val.trim();
        
        if (val !== '') {
            let info = {
                id: `${id2}`,
                name: `${name2}`,
                counter: "0",
            };
            
            petnames.push(info);

            localStorage.setItem(cookie_key, JSON.stringify(petnames));
        }
    }
    
}

function removePet(id2) {
    
    console.log("DEL removing ID: " + id2);
    
    petnames = petnames.filter(function(i,n,c){
        return i.id!==id2;
    });

    localStorage.setItem(cookie_key, JSON.stringify(petnames));   
}

function loadImages(event) {
    
    event.preventDefault();

    let optSelect = document.getElementById('category').value;

    if(optSelect!='-1')
    {
        // List images depending the category 

            let mGrid = document.getElementById('grid');
            mGrid.innerHTML = "<div class='loader'><div class='newtons-cradle'><div class='newtons-cradle__dot'></div><div class='newtons-cradle__dot'></div><div class='newtons-cradle__dot'></div><div class='newtons-cradle__dot'></div></div></div>";

            let urlImages = `https://api.thecatapi.com/v1/images/search?size=med&limit=${catsLimit}&category_ids=${optSelect}`;
            
            fetch(urlImages,{headers: {
                'x-api-key': api_key
                }})
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                mGrid.innerHTML = "";
                let limitCounter = 0;
                let imagesData = data;
                imagesData.map(function(imageData) {
                    
                        if(limitCounter<=catsLimit)
                        {
                            let imageId   = imageData.id;
                            let imageUrl  = imageData.url;
                            let imageName = "";
                            let imageCounter = "0";
                            let flagFromMemory = 0;

                            // Search the ID in localstorage, IF exist we have to take the name Saved before
                            let dataMemory = findID(imageId);

                            if(dataMemory.length>0)
                            {
                                imageName = dataMemory[1];      // GET THE NAME
                                imageCounter = dataMemory[2];   // GET COUNTER FROM ID
                                flagFromMemory = 1;

                                console.log("EXIST Data on Memory for ID: " + imageId + " -> " + dataMemory);

                                imageCounter++;

                                let info = {
                                    id: `${imageId}`,
                                    name: `${imageName}`,
                                    counter: `${imageCounter}`,
                                };

                                removePet(imageId);

                                console.log("PUSH the value: " + imageId + " - Counter: " + imageCounter);
                                petnames.push(info);
                                localStorage.setItem(cookie_key, JSON.stringify(petnames));
                            }
                            else {
                                console.log("DONT EXIST Data on Memory for ID: " + imageId + " -> " + dataMemory);
                            }

                            // Create the tag IMG with the url of the image
                            let image = document.createElement('img');
                            image.src = `${imageUrl}`;
                            image.alt = `ID: ${imageId}`;
                            image.classList.add('card__image');

                            // Create the tag P for Title - Card
                            let title = document.createElement('p');
                            title.classList.add('card__title');
                            
                            // Get a random name from catlist - Card
                            if(flagFromMemory==0){
                                imageName = catName();
                                console.log("- Get name from catlist: " + imageName);
                            }
                            
                            title.innerHTML = `${imageName}`;
                            
                            // Create the tag P for description - Card
                            let text = document.createElement('p');
                            text.classList.add('card__text');
                            
                            text.innerHTML = `ID: ${imageId} Counter: ${imageCounter}`;
                            

                            // Join the new tags with the content into the main DIV
                            if(imageName) {
                                let gridCell = document.createElement('div');
                                gridCell.classList.add('card__content');
                                gridCell.appendChild(image);
                                gridCell.appendChild(title);
                                gridCell.appendChild(text);
                                
                                document.getElementById('grid').appendChild(gridCell);

                                limitCounter++;
                            }
                            
                            // Save the ID, Name and Counter into the cookie
                            if(flagFromMemory==0 && imageName){
                                console.log("Sending for save: " + imageId + " - " + imageName);    
                                saveData(imageId, imageName);
                            }
                        }

                    });
                })
            .catch(function(error) {
                console.log(error);
            });
    }
    else{
        let mGrid = document.getElementById('grid');
        mGrid.innerHTML = "<div class='alert alert-danger' role='alert'>Select a valid Category</div>";
    }
}

function getCategories(){
    // Get Cats categories
    const url = 'https://api.thecatapi.com/v1/categories';

    fetch(url,{headers: {
        'x-api-key': api_key
        }})
    .then((response) => {
    return response.json();
    })
    .then((content) => {
        let objectCount = Object.keys(content).length;

        if(objectCount>0){
            content.map( (post) => {
                let mId   = post.id;
                let mName = post.name;

                let mOption = document.createElement('option');
                mOption.value = mId;
                mOption.innerHTML = `${mName}`;
                document.getElementById('category').appendChild(mOption);
            });
        }
    })
    .catch(function(error) {
    console.log(error);
    });
}
