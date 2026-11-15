import {validateStory} from "./validate.mjs";
function runTests(validate){
 const expected={id:"BI-test-0001",date:"2026-11-15",sport:"Fussball",outcome:"LOST",legs:[{home:"Team A",away:"Team B",selection:"Team A gewinnt"}]};
 const urls=["https://example.org/game","https://example.net/match"], citations=urls.map(url=>({url,title:"Test fixture"})), long="Test fixture narrative. ".repeat(40);
 const tr={heading:"Match review",conclusion_heading:"Conclusion",summary:long,note:"Test source notice for this example",legs:[{market:"Team A wins",narrative:long,wager_logic:"Test selection explanation",events:["First event","Second event"]}]};
 const raw={verified:true,match_date:expected.date,legs:[{home:"Team A",away:"Team B",score:"1:2",selection_outcome:"LOST",sources:urls,events:[{minute:"45",de:"Testereignis eins",en:"Test event one"},{minute:"90",de:"Testereignis zwei",en:"Test event two"}],narrative_de:long,narrative_en:long,logic_de:long,logic_en:long}],translations:Object.fromEntries(["de","en","es","pt","it","fr","nl","zh"].map(k=>[k,tr]))};
 let count=0;if(validate(raw,citations,expected).outcome==="LOST")count++;
 for(const mutate of [x=>x.match_date="2026-11-14",x=>x.legs[0].away="Other",x=>x.legs[0].events=[],x=>x.legs[0].sources=["https://example.com/invented"],x=>x.legs[0].score="3:1",x=>delete x.translations.fr]){let c=JSON.parse(JSON.stringify(raw));mutate(c);try{validate(c,citations,expected)}catch{count++}}
 if(count!==7)throw Error("TEST_FAILED_"+count);return count;
}
console.log(runTests(validateStory)+" validation tests passed");
