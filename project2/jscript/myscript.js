
    // 1
    window.onload = (e) => {document.querySelector("#search").onclick = SearchButtonClicked
                            document.querySelector("#searchTerm").onkeypress = SearchBar
                            document.querySelector("#change").onclick = IterateSearchType
                            document.querySelector("#singleSearch").onclick = SearchByColorOnly;};


    // 2
    let space = "c%3A";
    let displayTerm = "";
    let colorIdentifier = ["U", "G", "R", "B", "W"];
    let possibleColors = [];
    let currentColors = [];
    let colorUrl = ["c%3Ablue", "c%3Agreen", "c%3Ared", "c%3Ablack", "c%3Awhite"];
    let seachType = "";
    let testString = "t test";
    let searchIndex = 0;


    //This function searches for magic cards based on color desired by user.
    function SearchButtonClicked(){
        console.log("searchButtonClicked() called");
        //const urlGIPHY = "https://dog.ceo/api/breeds/image/random";
        //const urlMagic = "https://api.scryfall.com/cards/search?q=c%3Awhite+cmc%3D1";
        //color>%3Duw+-c%3Ared
        const urlScryfall = "https://api.scryfall.com";
        const urlSearch = "https://api.scryfall.com/cards/search?q=";
        possibleColors = []
        let url = urlSearch;
        let term = null; 
        let searchParameters = "";
        let searchMulticolor = document.getElementById("multi");
        console.log(colorIdentifier);
        displayTerm = term;

        if(searchParameters == ""){
            let colorsChecked = document.getElementsByClassName("color"); 

            //Searches for multiple colors
            if(searchMulticolor.checked){
                for (i = 0; i < colorsChecked.length; i++) {
                console.log(colorsChecked[i].checked);
                if(colorsChecked[i].checked){
                    possibleColors.push(colorsChecked[i].value);
                    if(searchParameters == ""){
                    searchParameters += "color>%3D" + colorIdentifier[i].toLowerCase();
                }
                else{
                searchParameters += colorIdentifier[i].toLowerCase();
                }
            }
                }
            }
            //Searches for cards of specified colors
            else{
                let exclude = "";
                for (i = 0; i <= colorsChecked.length-1; i++){
                    if(colorsChecked[i].checked){
                        if(searchParameters == ""){
                        searchParameters += "color>%3D" + colorIdentifier[i].toLowerCase();                     
                        }
                        else{
                        searchParameters += colorIdentifier[i].toLowerCase();
                        }
                    }
                    else{
                        exclude += "+-" + colorUrl[i].toLowerCase();
                    }
                }
                searchParameters += exclude;
            }
        }
        if(displayTerm == null){
            displayTerm = "Colors";
        }

        document.querySelector("#status").innerHTML = "<b>Searching for '" + displayTerm + "'</b>";    
        url += searchParameters;
        console.log(url);
        getData(url);
    }

    //This function searches by individual color
    function SearchByColorOnly()
    {
        const urlSearch = "https://api.scryfall.com/cards/search?q=";
        let url = urlSearch;
        let term = document.querySelector("#color").value;
        url += "c%3A" + term;
        let cmc = document.querySelector("#cmc").value;
        url += "+cmc%3D" + cmc;

        if(displayTerm == null){
            displayTerm = "color";
        }

        document.querySelector("#status").innerHTML = "<b>Searching for specified '" + displayTerm + ":" + term + "'</b>";    
        getData(url);
    }

    //This function allows the user to type in some input and get values based on the input.
    function SearchBar(e)
    {
        let keyVal;
        const urlSearch = "https://api.scryfall.com/cards/search?q=";
        let url = urlSearch;
        let term = null; 
        let searchVal = "";

        if(window.event){
            keyVal = e.keyCode;
        }else if(e.which){
            keyVal = e.which;
        }

        // console.log(keyVal);
        searchVal =  document.querySelector("#searchTerm").value;  

        //If the user presses 'Enter' get
        //currentSearch and search with it!
        if(searchVal != "" && keyVal == 13)
            {   
            let currentSearch = "";   
            currentSearch = SearchType(searchIndex);
            currentSearch += "%3A";
            currentSearch += searchVal;
            displayTerm = searchVal;
            document.querySelector("#status").innerHTML = "<b>Searching for all '" + displayTerm + "'</b>";
            url += currentSearch;
            getData(url);
        }
        else if(keyVal == 13){
            SearchButtonClicked();
        }
    }

    //Returns proper syntax for each search type
    function SearchType(index){
        switch(index)
        {
            case 0:
                return "t";
            break;
            case 1:
                return "year";
            break;
            case 2:
                return "is";
            break;
            case 3:
                return "r";
            break;
            case 4:
                return "!";
            break;
        }
    }

    //This function changes the type of search (managed via index)
    //and also changes the placeholder text of the searchbar element.
    function IterateSearchType(){
        console.log("Search Type Changed!");

        console.log(searchIndex)
        switch(searchIndex)
        {
            case 0:
                document.querySelector("#searchTerm").placeholder = "Searching by Year";
                searchIndex += 1;
                break;
            case 1:
                document.querySelector("#searchTerm").placeholder = "Searching by Type";
                searchIndex += 1;
                break;
            case 2:
                document.querySelector("#searchTerm").placeholder = "Searching by Rarity";
                searchIndex += 1;
                break;
            case 3:
                document.querySelector("#searchTerm").placeholder = "Searching by Exact Name";
                searchIndex += 1;
                break;
            case 4:
                document.querySelector("#searchTerm").placeholder = "Searching is: funny, hybrid, permanent etc.";
                searchIndex = 0;
                break;
            default:
                searchIndex = -1;
                break;
        }
    }

    //Gets the data from an HttpRequest
    function getData(url){
        let xhr = new XMLHttpRequest();
        console.log(xhr);
        xhr.onload = dataLoaded;
        xhr.onerror = dataError;
        xhr.open("GET", url); 
        xhr.send();
    }

    //This function loads data recieved from API
    //and then parses it to a JSON object.
    function dataLoaded(e){
        let xhr = e.target;

        let obj = JSON.parse(xhr.responseText);

        //Return is error in search
        if(obj.code == "not_found"){
            document.querySelector("#status").innerHTML = "<b>No results found for '" + displayTerm + "'</b>";
            return;
        }
        
        //Return if no cards are found but search was valid
        if(obj.totalCards == 0){
            document.querySelector("#status").innerHTML = "<b>No results found for '" + displayTerm + "'</b>";
            return;
        }

        //Parse all data from object
        let totalCards = obj.total_cards;
        let data = obj.data;

        console.log(data.length);

        let bigString = "";
        console.log("Current Possible Colors: " + possibleColors);

        //Iterates through array of data
        //Grabbing all important data
        for(let i=0; i < data.length; i++)
        {
            //Load Card
            let card = data[i];  
            let matchingColors = true;       
            let cardColor = card.colors;                  
            let cardName = card.name;
            let rarity = card.rarity;
            let cNumber = card.collector_number;
            if(cNumber == null){
                cNumber = "N/A";
            }
            //console.log(cNumber);
            let manaCost = card.cmc;    
            let usPrice = card.prices.usd;

            if(usPrice == null){
                usPrice = "N/A";
            }

            let euPrice = card.prices.eur;  
            if(euPrice == null){
                euPrice = "N/A";
            }

            let cardImage = "";
            if(card.image_uris == undefined){
            cardImage =  "images/no-image-found.png";
            }
            else{
            cardImage = card.image_uris.border_crop;
            }

            let line = `<div class ='result'><img src='${cardImage}' title= '${cardName}' />`;
            line += `<span><p>Rarity: ${rarity}<br>CMC: ${manaCost}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;C#: 
            ${cNumber}<br>Price: $ ${usPrice}, € ${euPrice}</p></span></div>`;
            bigString += line;
        }

        document.querySelector("#content").innerHTML = bigString;
        document.querySelector("#status").innerHTML = "<b>Success!</b>";
    }

    function dataError(e){
    console.log("An error occurred");
    }