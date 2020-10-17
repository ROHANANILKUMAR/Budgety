//Budget Controller
var budgetController = (function(){

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            exp: 0,
            Inc: 0
        },
        budget:0,
        percentage:null
    };
    
    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome>0){
            this.percentage = Math.round((this.value/totalIncome)*100);
        }
        else{
            this.percentage = '--';
        }
        
    }

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        data.totals[type]=0;
        data.allItems[type].forEach((object)=>data.totals[type]+=object.value);
    }

    var deleteItem = function(type, id){
        var ind = data.allItems[type].findIndex((obj)=>obj.id===id);
        if(ind>=0){
            data.allItems[type].splice(ind,1);
            return data.allItems[type];
        }
        
    }

    var calculateBudget = function(){
        calculateTotal('inc');
        calculateTotal('exp');

        data.budget = data.totals.inc - data.totals.exp;
        if(data.totals.inc>0){
            data.percentage = Math.round((data.totals.exp/data.totals.inc) *100);
        }
        else{
            data.percentage = null;
        }

        data.allItems.exp.forEach((element)=>{ element.percentage = Math.round((element.value/data.budgetIncomePercentage)*100)})
    };

    var calculatePercentages = function(){
        data.allItems.exp.forEach((object)=>{
            object.calcPercentage(data.totals.inc);
        })
    }

    var getPercentages = function(){
        var percentages = data.allItems.exp.map((object)=>{
            return object.getPercentage();
        })
        return percentages;
    }

    return{
        addItem: function(type, des, val){
            var newItem;
            var indLast = data.allItems[type].length - 1 ;

            var id = ((indLast === -1)? 0 : data.allItems[type][indLast].id + 1);

            switch(type){
                case('exp'):
                    newItem = new Expense(id,des,val);
                    break;

                case('inc'):
                    newItem = new Income(id,des,val);
                    break;
            }
            data.allItems[type].push(newItem);
            data.totals[type]++;
            return newItem;
        },
        calculateBudget: calculateBudget,
        deleteItem: deleteItem,
        calculatePercentages: calculatePercentages,
        getPercentages: getPercentages,
        getBudget: function(){
            return{
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                budget: data.budget,
                percentage: data.percentage,
            }
        }
    };
    


})();


//UI controller
var UIController = (function(){
    var DOMs = {
        addBtn : document.querySelector('.add__btn'),
        addValueEntry : document.querySelector('.add__value'),
        addDescriptionEntry : document.querySelector('.add__description'),
        fields: document.querySelectorAll('.add__value,.add__description'),

        expenseList : document.querySelector('.expenses__list'),
        incomeList : document.querySelector('.income__list'),

        budgetTitleMonth : document.querySelector('.budget__title--month'),
        budgetValue : document.querySelector('.budget__value'),
        budgetIncomeValue : document.querySelector('.budget__income--value'),
        budgetIncomePercentage : document.querySelector('.budget__income--percentage'),
        budgetExpenseValue : document.querySelector('.budget__expenses--value'),
        budgetExpensePercentage : document.querySelector('.budget__expenses--percentage'),
        
        budgetAddType : document.querySelector('.add__type'),

        itemDeleteBtn : document.querySelector('item__delete--btn'),
        container : document.querySelector('.container'),

        expensesPercentagesStr:('.item__percentage'),

        datelabel: document.querySelector('.budget__title--month')
    
    };

    var incomeListHTML = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
    var outcomeListHTML = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
    
    var clearFields = function(){
        var fieldsArr = Array.prototype.slice.call(DOMs.fields);
        fieldsArr.forEach((element)=>{
            element.value='';
        })
        fieldsArr[0].focus();

    }
            
    
    var addListItem = function(obj,type){
        
        if(type==='inc'){
            var newHTML = incomeListHTML; 
            newHTML = newHTML.replace('%id%',obj.id);
            newHTML = newHTML.replace("%value%",formatNumber(obj.value,type));
            newHTML = newHTML.replace("%description%",obj.description);
            DOMs.incomeList.insertAdjacentHTML('beforeend',newHTML);

        }
        else if(type==='exp'){
            var newHTML = outcomeListHTML; 
            newHTML = newHTML.replace('%id%',obj.id);
            newHTML = newHTML.replace("%value%",formatNumber(obj.value, type));
            newHTML = newHTML.replace("%description%",obj.description);
            newHTML = newHTML.replace("%percentage%",20);
            DOMs.expenseList.insertAdjacentHTML('beforeend',newHTML);
        }

    }

    var removeListItem = function(itemID){
        var element = document.getElementById(itemID) ;
        element.parentNode.removeChild(element);
    }
    
    var displayBudget = function(budget){
        DOMs.budgetValue.textContent = formatNumber(budget.budget, budget.budget>=0?'inc':'exp');
        DOMs.budgetIncomeValue.textContent = formatNumber(budget.totalInc,'inc');
        DOMs.budgetExpenseValue.textContent = formatNumber(budget.totalExp,'exp');
        if(budget.percentage){
            DOMs.budgetExpensePercentage.textContent = budget.percentage+"%";
        }
        else{
            DOMs.budgetExpensePercentage.textContent = '--';
        }
    }

    var displayPercentages = function(percentages){
        var nodeListForEach = function(list,fn){
            for(var i = 0; i<list.length; i++){
                fn(list[i],i);
            }
        }
        
        var percentagesItems = document.querySelectorAll(DOMs.expensesPercentagesStr);

        nodeListForEach(percentagesItems,(ele,ind)=>{
            var percentage = percentages[ind];
            if(percentage !== '--'){
                ele.textContent = percentage+"%"
            }
            else{
                ele.textContent = '--';
            }
            
        });
    }

    var displayMonth = function(){
        var now = new Date();
        var months = ['January','February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        var month = now.getMonth();
        var year = now.getFullYear();

        DOMs.datelabel.textContent = months[month]+', '+year
;
    }

    var formatNumber = function(num,type){
        num = Math.abs(num);
        num = num.toFixed(2);
        var int = num.split('.')[0]
        var decimal = num.split('.')[1];
        if(int.length>3){
            int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,int.length);
        }
        num = ((type === 'inc')? '+' : '-')+ ' ' + int + '.' + decimal;
        return num
    }


    var getInput = function(){
        var type = DOMs.budgetAddType.value;  //inc or exp
        var description = DOMs.addDescriptionEntry.value;
        var value = parseFloat(DOMs.addValueEntry.value);

        return {

            type: type,
            description: description,
            value: value,

            
        };

    }

    var changeType = function(){
        var fields = [DOMs.budgetAddType,DOMs.addDescriptionEntry,DOMs.addValueEntry];
        fields.forEach((object)=>{
            object.classList.toggle('red-focus');
        })

        DOMs.addBtn.classList.toggle('red');

    }


    return {
        addListItem: addListItem,
        getInput: getInput,
        getDOMStrings : function(){
            return DOMs;
        },
        clearFields: clearFields,
        displayBudget: displayBudget,
        removeListItem: removeListItem,
        displayPercentages: displayPercentages,
        displayMonth:displayMonth,
        changeType: changeType
    }

})()


//APP controller
var controller = (function(budgetCtrl, UICtrl){

    var setupEventListeners = function(){
        doms.addBtn.addEventListener('click',addBtnClicked);
        document.addEventListener('keypress', (event)=>{
            if(event.keyCode === 13 || event.which === 13){ //13=ENTER
                addBtnClicked();
            }
        });
        doms.container.addEventListener('click',ctrlDeleteItem);

        doms.budgetAddType.addEventListener('change',UICtrl.changeType);

        
    };
    var ctrlDeleteItem = function(event){
        var itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;  //DOM traversing
        console.log(itemId);
        if(itemId){
            var type = itemId.split('-')[0];
            var id = Number.parseInt(itemId.split('-')[1]);
            
            budgetCtrl.deleteItem(type,id);
            UIController.removeListItem(itemId);
            
            updateBudget();
            updatePercentages();
        }
    };



    var addBtnClicked = function(){
        var input = UIController.getInput();

        if(input.description && input.type && input.value){
            var item = budgetCtrl.addItem(input.type,input.description,input.value);
            UICtrl.addListItem(item,input.type);
            UICtrl.clearFields();
            updateBudget();
            updatePercentages();
        }
    };


    var updateBudget = function(){
        budgetCtrl.calculateBudget();
        var budget = budgetCtrl.getBudget();
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function(){
        budgetCtrl.calculatePercentages();
        var percentages = budgetCtrl.getPercentages();
        UIController.displayPercentages(percentages);

    };

    var doms=UICtrl.getDOMStrings();

    return {
        init: function(){
            console.log('JS ready');
            setupEventListeners();
            UICtrl.displayMonth();
            updateBudget();
            
        }
    }

})(budgetController,UIController)

onload = controller.init();



