
//--------------------------------------------------------------------------------------//
//                                                                                      //
//                                   Global Variables                                   //
//                                                                                      //
//--------------------------------------------------------------------------------------//


/*
    0, 1/8, 1/4, 1/2, 1...
    CR's are X-3 where x is array index past first 4 (index > 3)
 */
const CRarray = [0, 0.125, 0.25, 0.5, 1, 2, 3, 4, 5, 6, 7 ,8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
const CRStrarray = ["0", "1/8", "1/4", "1/2", "1", "2", "3", "4", "5", "6", "7" ,"8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"]
const hpArray = [6, 35, 49, 70, 85, 100, 115, 130, 145, 160, 175, 190, 205, 220, 235, 250, 265, 280, 295, 310, 325, 340, 355, 400, 445, 490, 535, 580, 625, 670, 715, 760, 805, 850]
/* AC can be <=13 for CR 0 */
const ACarray = [13, 13, 13, 13, 13, 13, 13, 14, 15, 15, 15, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19]
/* Attack Bonus can be <=3 for CR 0 */
const atkarray = [3, 3, 3, 3, 3, 3, 4, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 9, 10, 10, 10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 13, 14]
const dmgarray = [1, 3, 5, 8, 14, 20, 26, 32, 38, 44, 50, 56, 62, 68, 74, 80, 86, 92, 98, 104, 110, 116, 122, 140, 158, 176, 194, 212, 230, 248, 266, 284, 302, 320]
const profarray = [2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 9, 9]
/* Save DC can be <=13 for CR 0 */
const savearray = [13, 13, 13, 13, 13, 13, 13, 14, 15, 15, 15, 16, 16, 16, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 21, 21, 21, 22, 22, 22, 23]

function validateArraySizes(){
    let msg = "CRarray.length = "+CRarray.length+"\nhpArray.length = "+hpArray.length+"\nACarray.length = "+ACarray.length+"\natkarray.length = "+atkarray.length+"\ndmgarray.length = "+dmgarray.length+"\nsavearray.lenght = "+savearray.length
    alert(msg)
}

var minScale = 0;
var maxScale = 33;

//--------------------------------------------------------------------------------------//
//                                                                                      //
//                      Calculation of Defensive and Offensive CR                       //
//                                                                                      //
//--------------------------------------------------------------------------------------//


//based on HP and AC
/*
Read down the Hit Points column of the Monster Statistics by Challenge Rating table until you find your monster's hit points. 
Then look across and note the challenge rating suggested for a monster with those hit points.

Now look at the Armor Class suggested for a monster of that challenge rating. If your monster's AC is at least two points higher 
or lower than that number, adjust the challenge rating suggested by its hit points up or down by 1 for every 2 points of difference.
*/
function calcDefensiveCR(multiplier){
    document.getElementById("errormsg").innerHTML = ""; 
    if(document.getElementById("ac").value.length == 0){
        document.getElementById("errormsg").innerHTML = "ERROR: no armour-class value set"; 
        return -1;
    }
    var defCR = -1;
    //get required values
    let vulnerable = document.getElementById("vulnerabilities").checked;
    var hpMultiplier = 1;
    if(vulnerable == true){
        hpMultiplier = 0.5;
    }
    var inputHP = document.getElementById("hit-points-value").value; 
    let ac = parseInt(document.getElementById("ac").value) + parseInt(getSaveThrowACBonus()) + parseInt(getFlyACBonus()); 
    //display error
    if(inputHP == "???" || inputHP < 1){
        document.getElementById("errormsg").innerHTML = "ERROR: monster has valid no HP set"; 
        return -1;
    }
    //adjust effective HP
    inputHP = inputHP * hpMultiplier * multiplier;
    //find HP
    var index = 0;
    for(index=0; index<hpArray.length; index++){
        if(inputHP <= hpArray[index]){
            defCR = CRarray[index];
            break;
        }
    }
    //check if we actually got a valid CR from HP
    if(defCR < 0){
        //ERROR
        document.getElementById("errormsg").innerHTML = "ERROR: Not a valid HP amount, please check DMG table for allowed minimum and maximum HP values"; 
        return -1;
    }
    //calculate proper AC
    let crAC = ACarray[index];
    //adjust by 1 def CR for every 2 points above or below (if ac > crAC, we'll get positive number)
    let difac = ac - crAC;
    if(defCR == 0 && ac <= ACarray[0]){
        return defCR;
    }
    let changeCR = (Math.floor(difac/2));
    defCR = getCRWithDifference(index, changeCR);
    return defCR;
}


/*
Read down the Damage/Round column of the Monster Statistics by Challenge Rating table until you find your monster's damage output per round. 
Then look across and note the challenge rating suggested for a monster that deals that much damage.

Now look at the attack bonus suggested for a monster of that challenge rating. If your monster's attack bonus is at least two points higher 
or lower than that number, adjust the challenge rating suggested by its damage output up or down by 1 for every 2 points of difference.

If the monster relies more on effects with saving throws than on attacks, use the monster's save DC instead of its attack bonus.

If your monster uses different attack bonuses or save DCs, use the ones that will come up the most often.
*/
function calcOffensiveCR(){
    
    document.getElementById("errormsg2").innerHTML = ""; 
    if(document.getElementById("damagePerRound").value.length == 0){
        document.getElementById("errormsg").innerHTML = "ERROR: damage per round not set"; 
        return -1;
    }
    if(document.getElementById("atkBonus").value.length == 0){
        document.getElementById("errormsg").innerHTML = "ERROR: attack bonus not set"; 
        return -1;
    }
    if(document.getElementById("damagePerRound").value < 0 || document.getElementById("damagePerRound").value > 320){
        document.getElementById("errormsg").innerHTML = "ERROR: damage must be between 0 and 320"; 
        return -1;
    }
    if(document.getElementById("atkBonus").value < -5){
        document.getElementById("errormsg").innerHTML = "ERROR: attack bonus/save DC must be between -5 and 50"; 
        return -1;
    }
    var offcr = -1;
    let damagePerRound = document.getElementById("damagePerRound").value;
    let atkBonus = document.getElementById("atkBonus").value;
    let useSave = document.getElementById("useSave").checked; //true if checked, false otherwise
    //get offensive CR from dmg
    var index = -1;
        for(index = 0; index<dmgarray.length; index++){
            if(damagePerRound <= dmgarray[index]){
                offcr = CRarray[index];
                break;
            }
        }
        //check if we actually got a valid CR from dmg
        if(offcr < 0){
            //ERROR
            document.getElementById("errormsg2").innerHTML = "ERROR: Not a valid damage amount, please check DMG table for allowed minimum and maximum damage values"; 
            return -1;
        }
    //if not using saves
    if(useSave == false){
        //calculate proper atkbonus for dmg cr
        let crATK = atkarray[index];
        //adjust by 1 offensive CR for every 2 points above or below (if atkbonus > crATK, we'll get positive number)
        let difatk = atkBonus - crATK;
        if(offcr == 0 && atkBonus <= atkarray[0]){
            return offcr;
        }
        let changeCR = (Math.floor(difatk/2));
        offcr = getCRWithDifference(index, changeCR);
        return offcr;
    }
    //if using saves
    else{
        //calculate proper save bonus
        //in this case, atkBonus = saveDC
        let crSave = savearray[index];
        //adjust by 1 offensive CR for every 2 points above or below (if saveDC > crSave, we'll get positive number)
        let difatk = atkBonus - crSave;
        if(offcr == 0 && atkBonus <= savearray[0]){
            return offcr;
        }
        let changeCR = (Math.floor(difatk/2));
        offcr = getCRWithDifference(index, changeCR);
        return offcr;
    }
    //this shouldn't run, if it does, something went wrong
    console.log("calcOffensiveCR() failed to return a proper offensive CR")
    return -1;
}


//--------------------------------------------------------------------------------------//
//                                                                                      //
//                                 Calculate Average CR                                 //
//                                                                                      //
//--------------------------------------------------------------------------------------//


function calcAvgCR(){
    //get expected CR
    if(document.getElementById("expectedCR").value.length == 0){
        document.getElementById("errormsg").innerHTML = "ERROR: no expected CR set";
        return -1;
    }
    let expectedCRStr = document.getElementById("expectedCR").value;
    //if cr string isn't in returns -1, otherwise returns index of it
    let crIndex = CRStrarray.indexOf(expectedCRStr);
    if(crIndex == -1){
        document.getElementById("errormsg").innerHTML = "ERROR: not valid expected cr";
        return -1;
    }
    //get multplier for resistances/immunities based on expected CR, will be 1 if no resistances or immunities
    let expectedCR = CRarray[crIndex];
    let multiplier = getMultiplierForResistances(expectedCR);
    //get defensive cr
    let defCR = calcDefensiveCR(multiplier);
    if(defCR >= 0 && defCR < 30){
        var defCRstr = defCR;
        getCRString(defCR)
        document.getElementById("defCR").innerHTML = defCRstr;
        document.getElementById("defenceCRAvg").value = defCRstr;
    }
    //if CR was out of bounds
    else{
        document.getElementById("errormsg").innerHTML = "ERROR: defensive cr ended up being less than 0 or greater than 30";
        document.getElementById("defCR").innerHTML = "?";
        document.getElementById("avgCR").innerHTML = "?";
        document.getElementById("defenceCRAvg").value = -1;
        document.getElementById("CRAverage").value = -1;
    }
    //get offensive cr
    let offCR = calcOffensiveCR();
    if(offCR >=0 && offCR < 30){
        var offCRstr = getCRString(offCR)
        document.getElementById("offCR").innerHTML = offCRstr;
        document.getElementById("offenceCRAvg").value = offCRstr;
    }
    else{
        document.getElementById("errormsg2").innerHTML = "ERROR: offensive cr ended up being less than 0 or greater than 30";
        document.getElementById("offCR").innerHTML = "?";
        document.getElementById("avgCR").innerHTML = "?";
        document.getElementById("offenceCRAvg").value = -1;
        document.getElementById("CRAverage").value = -1;
    }
    
    //get average cr
    let defCRindex = lookupIndexByCR(defCR);
    let offCRindex = lookupIndexByCR(offCR);
    let avgCRindex = Math.round((defCRindex + offCRindex) / 2)
    let avgCR = CRarray[avgCRindex];
    var avgCRstr = getCRString(avgCR)
    document.getElementById("avgCR").innerHTML = avgCRstr;
    document.getElementById("CRAverage").value = avgCRstr;
    updateSliderLabel(avgCRindex, defCRindex, offCRindex);
}


//--------------------------------------------------------------------------------------//
//                                                                                      //
//                         Helper Functions for CR Calculation                          //
//                                                                                      //
//--------------------------------------------------------------------------------------//


/**
 * 
 * @returns AC bonus based on if it flies or not
 */
function getFlyACBonus(){
    let saveAmount = document.getElementById("fliesCanDmgRange").checked;
    var acBonus = 0;
    if(saveAmount == true){
        let expectedCRStr = document.getElementById("expectedCR").value;
        //if cr string isn't in returns -1, otherwise returns index of it
        let crIndex = CRStrarray.indexOf(expectedCRStr);
        //get multplier for resistances/immunities based on expected CR, will be 1 if no resistances or immunities
        let expectedCR = CRarray[crIndex];
        if(expectedCR < 10){
            acBonus = 2;
        }
    }
    return acBonus;
}

/**
 * 
 * @returns AC bonus based on number of save proficiencies based on DMG
 */
function getSaveThrowACBonus(){
    let saveAmount = document.getElementById("saveProficiencies").value;
    if(saveAmount == "zeroToTwo"){
        return 0;
    }
    else if(saveAmount == "threeToFour"){
        return 2;
    }
    else{
        return 4;
    }
}

/**
 * 
 * @param {*} expectedCR 
 * @returns multiplier
 */
function getMultiplierForResistances(expectedCR){
    let resistanceType = document.getElementById("resistances").value;
    if(resistanceType == "none"){
        return 1;
    }
    else if(resistanceType == "resistances"){
        if(expectedCR >= 1 && expectedCR <= 4){
            return 2;
        }
        else if(expectedCR >= 5 && expectedCR <= 10){
            return 1.5;
        }
        else if(expectedCR >= 11 && expectedCR <= 16){
            return 1.25;
        }
        else{
            return 1;
        }
    }
    else if(resistanceType == "immunities"){
        if(expectedCR >= 1 && expectedCR <= 4){
            return 2;
        }
        else if(expectedCR >= 5 && expectedCR <= 10){
            return 2;
        }
        else if(expectedCR >= 11 && expectedCR <= 16){
            return 1.5;
        }
        else{
            return 1.25;
        }
    }
    else{
        //shouldn't come here
        console.log("Error in getMultiplierForResistances(expectedCR), couldn't find resistance type")
        return -1;
    }
}


/**
 * 
 * @param {*} cr 
 * @returns CR string
 */
function getCRString(cr){
    var str = cr;
    if(cr == 0.125){
        str = "1/8"
    }
    else if(cr == 0.25){
        str = "1/4"
    }
    else if(cr == 0.5){
        str = "1/2"
    }
    return str;
}

/**
 * Get's the difference between base CR and the adjustment
 * @param {*} index 
 * @param {*} difference 
 */
function getCRWithDifference(index, difference){
    let newArrayPos = index+difference;
    //if too low, just set CR for that is 0
    if(newArrayPos < 0){
        return 0;
    }
    else if(newArrayPos > CRarray.length){
        return -100;
    }
    return CRarray[index+difference];

}



function calcConstModifier(){
    //10 == avge, every 2 up = +1, every 2 down = -1
    let constitution = document.getElementById("constitution").value;
    constmodifier = Math.floor((constitution/2) - 5)
    //log it
    console.log("constitution modifier is: "+constmodifier)
    return constmodifier
}


function lookupIndexByCR(cr){
    var i = 0;
    for(i=0; i<CRarray.length; i++){
        if(cr == CRarray[i]){
            return i;
        }
    }
    //else we didn't get anything
    console.log("Failed to lookup index of given CR")
    return -1;
}



//--------------------------------------------------------------------------------------//
//                                                                                      //
//                                Interactive Functions                                 //
//                                                                                      //
//--------------------------------------------------------------------------------------//

/**
 * 
 * @returns true if all fields filled, false otherwise
 */
function allFieldsFilled(){
    if(document.getElementById("expectedCR").value.length == 0){
        return false;
    }
    else if(document.getElementById("constitution").value.length == 0){
        return false;
    }
    else if(document.getElementById("hitdice").value.length == 0){
        return false;
    }
    else if(document.getElementById("ac").value.length == 0){
        return false;
    }
    else if(document.getElementById("damagePerRound").value.length == 0){
        return false;
    }
    else if(document.getElementById("atkBonus").value.length == 0){
        return false;
    }
    else{
        return true;
    }
}

function fieldChanged(){
    healthchange();
    if(allFieldsFilled()){
        calcAvgCR();
    }
}

function healthchange(){
    let size = document.getElementById("size").value;
    //change dice number shown (d4, d6, d8, etc...)
    document.getElementById("diceNumber").innerHTML = "d"+size;
    //validate non-empty fields before calculating health
    if(document.getElementById("constitution").value.length == 0){
        document.getElementById("hit-points").innerHTML = "???"
        console.log("No Constitution set")
        return;
    }
    if(document.getElementById("hitdice").value.length == 0){
        document.getElementById("hit-points").innerHTML = "???"
        console.log("No Hit dice set")
        return;
    }
    let constmodifier = calcConstModifier();
    let hitdiceamount = document.getElementById("hitdice").value;
    let hp = Math.floor(((size/2) + 0.5)*hitdiceamount + constmodifier*hitdiceamount);
    document.getElementById("hit-points").innerHTML = hp;
    document.getElementById("hit-points-value").value = hp;
    return;
}

function updateSliderLabel(crIndex, defCRIndex, offCRIndex){
    ///if >0, means it's bigger
    let diffDef = defCRIndex - crIndex;
    let diffOff = offCRIndex - crIndex;
    if(diffDef > 0 && diffOff <= 0){
        maxScale = 33 - diffDef;
        minScale = 0 - diffOff;
    }
    else if(diffOff > 0 && diffDef <= 0){
        maxScale = 33 - diffOff;
        minScale = 0 - diffDef;
    }
    else{
        maxScale = 33;
        minScale = 0;
    }
    document.getElementById("crScale").min = minScale;
    document.getElementById("crScale").max = maxScale;
    document.getElementById("crScale").value = crIndex;
    changeSliderLabel();
}

function changeSliderLabel(){
    let crslider = document.getElementById("crScale");
    let crScaleText = document.getElementById("crScaleText");
    let cr = CRarray[crslider.value]
    var crStr = cr;
    if(cr == 0.125){
        crStr = "1/8"
    }
    else if(cr == 0.25){
        crStr = "1/4"
    }
    else if(cr == 0.5){
        crStr = "1/2"
    }
    crScaleText.innerHTML = crStr;
}

//--------------------------------------------------------------------------------------//
//                                                                                      //
//                                 Adjust CR Functions                                  //
//                                                                                      //
//--------------------------------------------------------------------------------------//


/**
 * 
 * @param {*} CR The CR string
 * @returns AC bonus
 */
 function getFlyACBonusVariable(CR){
    let saveAmount = document.getElementById("fliesCanDmgRange").checked;
    var acBonus = 0;
    if(saveAmount == true){
        let expectedCRStr = CR;
        //if cr string isn't in returns -1, otherwise returns index of it
        let crIndex = CRStrarray.indexOf(expectedCRStr);
        //get multplier for resistances/immunities based on expected CR, will be 1 if no resistances or immunities
        let expectedCR = CRarray[crIndex];
        if(expectedCR < 10){
            acBonus = 2;
        }
    }
    return acBonus;
}

function getVulnerableMultiplier(){
    let vulnerable = document.getElementById("vulnerabilities").checked;
    var hpMultiplier = 1;
    if(vulnerable == true){
        hpMultiplier = 0.5;
    }
    return hpMultiplier;
}

/**
 * 
 * @param {*} hp 
 * @returns index of HP amount, -1 otherwise
 */
function getHPAmount(hp){
    var index = 0;
    for(index=0; index<hpArray.length; index++){
        if(hp<hpArray[index]){
            return index;
        }
    }
    return -1;
}
function getACAmount(ac){
    var index = 0;
    for(index=0; index<ACarray.length; index++){
        if(index==0 && ac < ACarray[0]){
            return 0;
        }
        if(ac==ACarray[index]){
            return index;
        }
    }
    return -1;
}

function getDMGAmount(dmg){
    var index = 0;
    for(index=0; index<dmgarray.length; index++){
        if(dmg<dmgarray[index]){
            return index;
        }
    }
    return -1;
}

function getATKBonusAmount(atkBonus){
    var index = 0;
    for(index=0; index<atkarray.length; index++){
        if(atkBonus==atkarray[index]){
            return index;
        }
    }
    return -1;
}

function getEffectiveHP(HP, cr){
    let vulnerable = document.getElementById("vulnerabilities").checked;
    var hpMultiplier = 1;
    if(vulnerable == true){
        hpMultiplier = 0.5;
    }
    let multiplier = parseFloat(hpMultiplier) * parseFloat(getMultiplierForResistances(cr));
    return parseFloat(HP)*parseFloat(multiplier);
}

//TODO deal with extreme values of AC and Atk Bonus messing up scaling possibly? Current validation helps
function adjustCR(){
    //console.log("=====================");
    //get value to adjust to
    let newCRIndex = document.getElementById("crScale").value;
    //get the CR's as strings such as "0", "1/4", ...
    let defCRStr = document.getElementById("defenceCRAvg").value;
    let offCRStr = document.getElementById("offenceCRAvg").value;
    let avgCRStr = document.getElementById("CRAverage").value;
    //get index of old CR's
    let defCRIndex = CRStrarray.indexOf(defCRStr);
    let offCRIndex = CRStrarray.indexOf(offCRStr);
    let avgCRIndex = CRStrarray.indexOf(avgCRStr);
    //get scale amount
    let scaleIndex = newCRIndex - avgCRIndex;
    let newDefCRIndex = defCRIndex + scaleIndex;
    let newOffCRIndex = offCRIndex + scaleIndex;


    //!def CR stuff
    //get HP difference
    let oldHP = document.getElementById("hit-points-value").value;
    let expectedCRStr = document.getElementById("expectedCR").value;
    //if cr string isn't in returns -1, otherwise returns index of it
    let expectedCR = CRarray[CRStrarray.indexOf(expectedCRStr)];
    let oldEffectiveHP = getEffectiveHP(oldHP, expectedCR);
    let oldHPIndex = getHPAmount(oldHP);
    let oldEffectiveHPIndex = getHPAmount(oldEffectiveHP);
    //positive means had more effective HP than it's CR justifies
    let diffOldEffectiveHP = oldEffectiveHPIndex - defCRIndex;
    //get new effectiveHP based on def cr and difference between it
    let newEffectiveHP = hpArray[newDefCRIndex+diffOldEffectiveHP];
    let newHPMultiplier = parseFloat(getMultiplierForResistances(CRarray[newCRIndex])) * parseFloat(getVulnerableMultiplier());
    let newHP = Math.floor(parseFloat(newEffectiveHP) / parseFloat(newHPMultiplier));
    //old ac stuff
    let effectiveACChange = diffOldEffectiveHP * -2;
    //ac bonus based on new CR value
    let newACBonus = getFlyACBonusVariable(CRStrarray[newCRIndex]);
    let newAC = ACarray[getHPAmount(newEffectiveHP)] + effectiveACChange - newACBonus;

  
    


    //!set up values
    document.getElementById("newHP").innerHTML = newHP;
    document.getElementById("newAC").innerHTML = newAC;
    /*
    document.getElementById("newDmg").innerHTML = newDmg;
    document.getElementById("newAtkBonus").innerHTML = newAtk;
    */
}

