/*
    Global Variables
*/

/*
    0, 1/8, 1/4, 1/2, 1...
    CR's are X-3 where x is array index past first 4 (index > 3)
 */
const CRarray = [0, 0.125, 0.25, 0.5, 1, 2, 3, 4, 5, 6, 7 ,8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
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

//based on HP and AC
/*
Read down the Hit Points column of the Monster Statistics by Challenge Rating table until you find your monster's hit points. 
Then look across and note the challenge rating suggested for a monster with those hit points.

Now look at the Armor Class suggested for a monster of that challenge rating. If your monster's AC is at least two points higher 
or lower than that number, adjust the challenge rating suggested by its hit points up or down by 1 for every 2 points of difference.
*/
function calcDefensiveCR(){
    let defCR = -1;
    //get required values
    var inputHP = document.getElementById("hit-points").value; 
    //find HP
    let index = 0;
    for(index=0; index<hpArray.length; index++){
        if(inputHP <= hpArray[index]){
            defCR = CRarray[index];
        }
    }
    //check if we actually got a valid CR
    if(cr < 0){
        //ERROR
        return -1;
    }

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
    return;
}

function calcConstModifier(){
    //10 == avge, every 2 up = +1, every 2 down = -1
    let constitution = document.getElementById("constitution").value;
    constmodifier = Math.floor((constitution/2) - 5)
    //log it
    console.log("constitution modifier is: "+constmodifier)
    return constmodifier
}

function calcAvgCR(){

    document.getElementById("avgCR").innerHTML = "2";
}