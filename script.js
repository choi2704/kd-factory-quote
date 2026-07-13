const guardRates={"알루미늄":3500,"SUS201":4200,"SUS304":5200};
const jabaraRates={normal:{201:{1200:80000,1500:100000},304:{1200:120000,1500:140000}},premium:{201:{1200:110000,1500:130000},304:{1200:150000,1500:170000}}};
const houseRates={1350:{201:[250000,350000,450000,500000,600000],304:[300000,450000,550000,600000,700000]},1650:{201:[300000,450000,550000,600000,700000],304:[350000,500000,600000,650000,750000]}};
const houseLabels=["7.5m 이하 / 깊이 1000mm","8.5~10m / 깊이 1300mm","11~13m / 깊이 1700mm","14~16m / 깊이 2000mm","17~20m / 별도 확인"];
let guardMaterial="알루미늄",items=[];
const $=id=>document.getElementById(id),won=n=>(Math.round(n)||0).toLocaleString("ko-KR")+"원";
$("quoteDate").value=new Date().toISOString().slice(0,10);

// 제품 탭
 document.querySelectorAll("#productTabs button").forEach(b=>b.onclick=()=>{
  document.querySelectorAll("#productTabs button").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
  document.querySelectorAll(".product-form").forEach(x=>x.classList.remove("active"));
  const map={guard:"guardForm",jabara:"jabaraForm",lexan:"lexanForm",ladder:"ladderForm"};
  $(map[b.dataset.product]).classList.add("active");
 });

// 방범창
 document.querySelectorAll("#materialTabs button").forEach(b=>b.onclick=()=>{
  document.querySelectorAll("#materialTabs button").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");guardMaterial=b.dataset.material;updateGuard();
 });
["width","height","guardQty"].forEach(id=>$(id).addEventListener("input",updateGuard));
function calcGuard(){const w=+$("width").value,h=+$("height").value,q=Math.max(1,+$("guardQty").value||1);if(!w||!h)return null;const cells=Math.ceil(w*h/90000),unit=guardRates[guardMaterial],amount=cells*unit*q;return{kind:"guard",name:`방범창 (${guardMaterial})`,spec:`${w.toLocaleString()} × ${h.toLocaleString()}mm / ${cells}칸`,unitName:"EA",qty:q,unitPrice:cells*unit,amount,note:$("guardNote").value.trim(),conditions:[]}}
function updateGuard(){const c=calcGuard();$("selectedMaterial").textContent=guardMaterial;$("unitCount").textContent=c?c.spec.split(" / ")[1]:"0칸";$("unitPrice").textContent=c?won(guardRates[guardMaterial]):"0원";$("guardLinePrice").textContent=c?won(c.amount):"0원";$("guardStatus").textContent=c?`${$("width").value} × ${$("height").value} ÷ 90,000 = ${Math.ceil(+$('width').value*+$('height').value/90000)}칸 적용`:"가로와 세로를 입력해 주세요."}
$("addGuard").onclick=()=>{const c=calcGuard();if(!c)return alert("가로와 세로 사이즈를 입력해 주세요.");items.push(c);render();["width","height","guardNote"].forEach(id=>$(id).value="");$("guardQty").value=1;updateGuard()};

// 자바라
function houseIndex(m){if(m<=7.5)return 0;if(m<=10)return 1;if(m<=13)return 2;if(m<=16)return 3;if(m<=20)return 4;return-1}
function wheelName(v){return v==="angle"?"앵글바퀴":`${v}파이 우레탄`}
function calcJabara(){
 const type=$("jType").value,mat=$("jMaterial").value,h=$("jHeight").value,open=$("jOpen").value,wheel=$("jWheel").value;
 const mm=+$("jLength").value||0,m=mm/1000,q=Math.max(1,+$("jQty").value||1);if(m<3)return null;
 const basePerM=jabaraRates[type][mat][h],wheelPerM=wheel==="100"?5000:0,gateUnit=(basePerM+wheelPerM)*m;
 let houseUnit=0,houseText="선택 안 함",houseQty=0,houseEach=0;
 if($("houseUse").checked){const idx=houseIndex(m);if(idx<0)return{error:"하우스 포함 시 길이 20m 초과는 별도 문의가 필요합니다."};const hh=$("houseHeight").value,hm=$("houseMaterial").value;houseQty=open==="양개형"?2:1;houseEach=houseRates[hh][hm][idx];houseUnit=houseEach*houseQty;houseText=`H${hh} SUS${hm} · ${houseLabels[idx]} · ${houseQty}개${open==="양개형"?"(좌·우)":""}`;}
 const unitPrice=gateUnit+houseUnit,amount=unitPrice*q;
 return{kind:"jabara",name:"스텐 자바라 대문",spec:`${type==="normal"?"일반형":"고급형"} / SUS${mat} / H${h} / ${open} / ${wheelName(wheel)} / ${mm.toLocaleString()}mm${houseUnit?` / 하우스 ${houseText}`:""}`,unitName:"대",qty:q,unitPrice,amount,note:$("jNote").value.trim(),houseUnit,houseEach,houseQty,houseText,m,basePerM,wheelPerM,conditions:["자바라 최소 주문 길이 3m","자바라 배송비 화물착불","자바라 제작기간 주문 확정 후 평일 기준 4~5일"]};
}
function updateJabara(){const mm=+$("jLength").value||0,m=mm/1000,type=$("jType").value,mat=$("jMaterial").value,h=$("jHeight").value,wheel=$("jWheel").value;$("jLengthText").textContent=m.toFixed(2)+"m";$("jUnit").textContent=won(jabaraRates[type][mat][h]+(wheel==="100"?5000:0))+"/m";const c=calcJabara();if(c&&c.error){$("jStatus").textContent=c.error;$("jLinePrice").textContent="별도 문의";return}$("jHouse").textContent=c?c.houseText:($("houseUse").checked?"길이 입력 후 자동 계산":"선택 안 함");$("jLinePrice").textContent=c?won(c.amount):"0원";$("jStatus").textContent=c?`${m.toFixed(2)}m × ${won(c.basePerM+(c.wheelPerM||0))}${c.houseUnit?` + 하우스 ${won(c.houseEach)} × ${c.houseQty}개`:""}`:"최소 3,000mm 이상 길이를 입력해 주세요."}
["jType","jMaterial","jHeight","jOpen","jWheel","jLength","jQty","houseHeight","houseMaterial"].forEach(id=>$(id).addEventListener("input",updateJabara));
$("jHeight").addEventListener("change",()=>{$("houseHeight").value=$("jHeight").value==="1200"?"1350":"1650";updateJabara()});
$("houseUse").onchange=()=>{$("houseFields").classList.toggle("open",$("houseUse").checked);updateJabara()};
$("addJabara").onclick=()=>{const c=calcJabara();if(!c)return alert("자바라 최소 주문 길이는 3,000mm(3m)입니다.");if(c.error)return alert(c.error);items.push(c);render();$("jLength").value="";$("jQty").value=1;$("jNote").value="";$("houseUse").checked=false;$("houseFields").classList.remove("open");updateJabara()};

// 렉산 절단
function lexanSuggested(w,h,t){if(!w||!h)return 0;const factor=t===3?3000:2000;return Math.ceil(((w*h)/90000*factor)/1000)*1000}
function calcLexan(){const w=+$('lWidth').value,h=+$('lHeight').value,t=+$('lThickness').value,q=Math.max(1,+$('lQty').value||1);if(!w||!h)return null;const suggested=lexanSuggested(w,h,t),unit=+$('lUnitPrice').value||suggested;return{kind:'lexan',name:'렉산 절단',spec:`${t}T / ${$('lColor').value} / ${w.toLocaleString()} × ${h.toLocaleString()}mm`,unitName:'장',qty:q,unitPrice:unit,amount:unit*q,note:$('lNote').value.trim(),conditions:['렉산 배송비 화물착불','렉산 보호필름 유지 후 절단·포장']}}
function updateLexan(){const w=+$('lWidth').value,h=+$('lHeight').value,t=+$('lThickness').value,c=calcLexan(),s=lexanSuggested(w,h,t);$('lArea').textContent=w&&h?(w*h/1000000).toFixed(3)+'㎡':'0.000㎡';$('lSuggested').textContent=won(s);if(w&&h&&!$('lUnitPrice').value)$('lUnitPrice').placeholder=`추천 ${won(s)}`;$('lApplied').textContent=c?won(c.unitPrice):'0원';$('lLinePrice').textContent=c?won(c.amount):'0원';$('lStatus').textContent=c?'추천단가는 자동 계산값이며 공장 확정 단가로 수정할 수 있습니다.':'가로와 세로를 입력해 주세요.'}
['lThickness','lColor','lWidth','lHeight','lQty','lUnitPrice'].forEach(id=>$(id).addEventListener('input',updateLexan));
$('addLexan').onclick=()=>{const c=calcLexan();if(!c)return alert('렉산 가로와 세로를 입력해 주세요.');items.push(c);render();['lWidth','lHeight','lUnitPrice','lNote'].forEach(id=>$(id).value='');$('lQty').value=1;updateLexan()};

// 사다리
function calcLadder(){const h=+$('dHeight').value,w=+$('dWidth').value,step=Math.max(1,+$('dStep').value||300),q=Math.max(1,+$('dQty').value||1),unit=+$('dUnitPrice').value||0;if(!h||!w||!unit)return null;const steps=Math.ceil(h/step);return{kind:'ladder',name:$('dType').value,spec:`${$('dMaterial').value} / H${h.toLocaleString()} × W${w.toLocaleString()}mm / 디딤판 약 ${steps}개 / 안전망 ${$('dCage').value}`,unitName:'대',qty:q,unitPrice:unit,amount:unit*q,note:$('dNote').value.trim(),conditions:['사다리는 현장 치수와 고정방식 확인 후 제작','사다리 배송비 화물착불'],steps,cage:$('dCage').value}}
function updateLadder(){const h=+$('dHeight').value,step=Math.max(1,+$('dStep').value||300),c=calcLadder();$('dSteps').textContent=h?Math.ceil(h/step)+'개':'0개';$('dCageText').textContent=$('dCage').value;$('dApplied').textContent=c?won(c.unitPrice):won(+$('dUnitPrice').value||0);$('dLinePrice').textContent=c?won(c.amount):'0원';$('dStatus').textContent=c?'견적 목록에 추가할 수 있습니다.':'높이·폭·공급 단가를 입력해 주세요.'}
['dType','dMaterial','dHeight','dWidth','dStep','dCage','dQty','dUnitPrice'].forEach(id=>$(id).addEventListener('input',updateLadder));
$('addLadder').onclick=()=>{const c=calcLadder();if(!c)return alert('사다리 높이·폭·공급 단가를 입력해 주세요.');items.push(c);render();['dHeight','dUnitPrice','dNote'].forEach(id=>$(id).value='');$('dQty').value=1;updateLadder()};

function totals(){const supply=items.reduce((a,x)=>a+x.amount,0),vat=Math.round(supply*.1);return{supply,vat,grand:supply+vat}}
function render(){
 const body=$("itemsBody");
 if(!items.length)body.innerHTML='<tr class="empty"><td colspan="9">제품을 계산해 견적 목록에 추가해 주세요.</td></tr>';
 else body.innerHTML=items.map((x,i)=>`<tr><td>${i+1}</td><td><span class="product-tag">${({jabara:"자바라",guard:"방범창",lexan:"렉산",ladder:"사다리"}[x.kind]||x.kind)}</span><br>${x.name}</td><td class="spec-cell">${x.spec}</td><td>${x.unitName}</td><td>${x.qty}</td><td>${won(x.unitPrice)}</td><td><b>${won(x.amount)}</b></td><td>${x.note||""}</td><td><button class="delete" onclick="removeItem(${i})">삭제</button></td></tr>`).join("");
 const t=totals();$("supplyTotal").textContent=won(t.supply);$("vatTotal").textContent=won(t.vat);$("grandTotal").textContent=won(t.grand)
}
window.removeItem=i=>{items.splice(i,1);render()};
$("resetAll").onclick=()=>{if(confirm("모든 입력 내용과 견적 목록을 초기화할까요?")){items=[];document.querySelectorAll(".form-grid input").forEach(x=>x.value="");$("quoteDate").value=new Date().toISOString().slice(0,10);render()}};
$("makeQuote").onclick=()=>{if(!items.length)return alert("견적 목록에 제품을 추가해 주세요.");buildQuote();$("quoteSheet").classList.add("open");$("quoteSheet").setAttribute("aria-hidden","false");window.scrollTo(0,0)};
$("closeQuote").onclick=()=>{$("quoteSheet").classList.remove("open");$("quoteSheet").setAttribute("aria-hidden","true");window.scrollTo(0,0)};
$("printQuote").onclick=async()=>{buildQuote();if(document.fonts&&document.fonts.ready)await document.fonts.ready;requestAnimationFrame(()=>requestAnimationFrame(()=>window.print()))};
function quoteNumber(){const d=new Date();return`KD-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${String(Date.now()).slice(-5)}`}
function buildQuote(){const val=id=>$(id).value||"-";$("qNo").textContent=quoteNumber();$("qDate").textContent=val("quoteDate");$("qCompany").textContent=val("company");$("qManager").textContent=val("manager");$("qPhone").textContent=val("phone");$("qProject").textContent=val("project");$("qItems").innerHTML=items.map((x,i)=>`<tr><td>${i+1}</td><td>${x.name}</td><td class="spec-cell">${x.spec}</td><td>${x.unitName}</td><td>${x.qty}</td><td>${won(x.unitPrice)}</td><td>${won(x.amount)}</td><td>${x.note||""}</td></tr>`).join("");const t=totals();$("qSupply").textContent=won(t.supply);$("qVat").textContent=won(t.vat);$("qGrand").textContent=won(t.grand);$("qGrandTop").textContent=`총금액 ${won(t.grand)} (V.A.T. 포함)`;const conditions=[...new Set(items.flatMap(x=>x.conditions||[]))];$("qConditions").innerHTML=conditions.map(x=>`<p>${x}</p>`).join("")}
$("copyQuote").onclick=async()=>{const t=totals(),lines=["[강동자바라 통합 견적서]",`업체명: ${$("company").value||"-"}`,`담당자: ${$("manager").value||"-"}`,`연락처: ${$("phone").value||"-"}`,...items.map((x,i)=>`${i+1}. ${x.name} / ${x.spec} / ${x.qty}${x.unitName} / ${won(x.amount)}`),`공급가액: ${won(t.supply)}`,`부가세: ${won(t.vat)}`,`총금액: ${won(t.grand)}`,...new Set(items.flatMap(x=>x.conditions||[]))];try{await navigator.clipboard.writeText(lines.join("\n"));alert("견적내용을 복사했습니다.")}catch(e){prompt("아래 내용을 복사해 주세요.",lines.join("\n"))}};
updateGuard();updateJabara();updateLexan();updateLadder();render();

// 작업지시서
function workNumber(){const d=new Date();return`WORK-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${String(Date.now()).slice(-5)}`}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function processChecks(item){
 const base=["자재확인","절단","타공","용접","연마","조립","검수","포장"];
 if(item.kind==="jabara"){const a=[...base,"바퀴조립","개폐시험"];if(item.houseQty===2)a.push("좌측 하우스 제작","우측 하우스 제작");else if(item.houseQty===1)a.push("하우스 제작");return a;}
 if(item.kind==="lexan") return ["원판확인","치수마킹","재단","모서리확인","보호필름확인","포장","검수"];
 if(item.kind==="ladder") return ["자재확인","절단","디딤판가공","용접","연마/도장","안전망조립","고정브라켓","치수검사","검수","포장"];
 return [...base,"치수검사","부속확인"];
}
function buildWork(){
 const val=id=>$(id).value||"-";
 $("wNo").textContent=workNumber();$("wDate").textContent=val("quoteDate");$("wDue").textContent=val("dueDate");$("wCompany").textContent=val("company");$("wManager").textContent=val("manager");$("wPhone").textContent=val("phone");$("wProject").textContent=val("project");$("wWorker").textContent=val("worker");$("wCommonNote").textContent=val("project");
 const hasJabara=items.some(x=>x.kind==="jabara");$("wDelivery").textContent=hasJabara?"화물착불 / 출고 전 연락":"담당자 확인";
 $("workItems").innerHTML=items.map((x,i)=>`<section class="work-item"><div class="work-item-head"><b>${i+1}. ${esc(x.name)}</b><span>수량 ${esc(x.qty)}${esc(x.unitName)}</span></div><div class="work-item-body"><div class="work-spec"><b>제작 사양</b><br>${esc(x.spec)}<br><b>단가/금액</b> ${won(x.unitPrice)} / ${won(x.amount)}<br><b>비고</b> ${esc(x.note||"-")}</div><div class="work-process"><b style="grid-column:1/-1">품목별 확인</b>${processChecks(x).map(v=>`<label>□ ${v}</label>`).join("")}</div><div class="work-memo"><b>작업 메모 / 수정사항</b><br><br></div></div></section>`).join("");
}
$("makeWork").onclick=()=>{if(!items.length)return alert("견적 목록에 제품을 추가해 주세요.");buildWork();$("workSheet").classList.add("open");$("workSheet").setAttribute("aria-hidden","false");window.scrollTo(0,0)};
$("closeWork").onclick=()=>{$("workSheet").classList.remove("open");$("workSheet").setAttribute("aria-hidden","true");window.scrollTo(0,0)};
$("printWork").onclick=async()=>{buildWork();if(document.fonts&&document.fonts.ready)await document.fonts.ready;requestAnimationFrame(()=>requestAnimationFrame(()=>window.print()))};
$("copyWork").onclick=async()=>{const lines=["[강동자바라 작업지시서]",`업체명: ${$("company").value||"-"}`,`현장명: ${$("project").value||"-"}`,`납기예정: ${$("dueDate").value||"-"}`,`작업담당: ${$("worker").value||"-"}`,...items.map((x,i)=>`${i+1}. ${x.name} / ${x.spec} / ${x.qty}${x.unitName} / 비고: ${x.note||"-"}`)];try{await navigator.clipboard.writeText(lines.join("\n"));alert("작업지시 내용을 복사했습니다.")}catch(e){prompt("아래 내용을 복사해 주세요.",lines.join("\n"))}};
