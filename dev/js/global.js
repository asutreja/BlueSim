MAX_UDO_FIELDS = 5

/* only allowed types */
LIST_OF_TYPES = ["INT", "FLOAT", "BOOLEAN"];
/* list of tuples (field name, field type) */
LIST_OF_PARAMETERS = []

UPDATE_FORM = null;
UPDATE_SPLIT_FORM = null;
UPDATE_SERVER_FORM = null;
UPDATE_FUNC_FORM = null;
PATH_SHADOW_COLOR = "c2c2c2";

SIM_HAS_RUN = false;
SIM_IS_RUNNING = false;

USE_UDO = false; // false is the default

CANVAS_W = (window.innerWidth || document.body.clientWidth) * 0.97;
CANVAS_H = (window.innerHeight || document.body.clientHeight) * 0.8;
if(CANVAS_H < 500){ CANVAS_H = 500} 
if(CANVAS_W < 1000){ CANVAS_W = 1000} 


/* name of object being instantiated in sources.. just superficial */
NAME_OF_OBJECT = "Ping"

/* maximum number of messages */
MAX_MESSAGES = 3600;

function resetGlobals(){
    /* click it false */
    if(USE_UDO){
        $("#use_udo").click();
    }
    NAME_OF_OBJECT = "Ping";

    LIST_OF_PARAMETERS = [];

    UPDATE_SPLIT_FORM = null;
    UPDATE_SERVER_FORM = null;
    UPDATE_FUNC_FORM = null;
    UPDATE_FORM = null;

    SIM_HAS_RUN = false;
    SIM_IS_RUNNING = false;
}

/* map of distributions we will support, each points to the number of parameters it needs */
LIST_OF_DISTRIBUTIONS = {
    gamma: 2,
    pareto: 1,
    weibull: 2,
    constant: 1, 
    gaussian: 2, 
    exponential: 1, 
    random: 0,
    uniform: 2
};

/* link to a button to allow the user to download work */
function blueSimDownload(request, filename, str){
    var pom = document.createElement('a');
    switch(request){
        case "JSON":
            text = QueueApp.stringify();
            break;
        case "DATA":
            /* traverse models in QueueApp and gather stats */
            text = QueueApp.saveStatString();
            break;
		case "RAW":
			/* Dump raw data */
			text = QueueApp.outputRawData();
			break;
    }
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    pom.style.display = 'none';
    document.body.appendChild(pom);

    pom.click();

    document.body.removeChild(pom);
}

/* on the fly random number distributor */
function randDist(distString, paramArray, randObject){
    switch(distString){
        case "gaussian":
            return +randObject.normal(+paramArray[0], +paramArray[1]);
        case "gamma":
            return +randObject.gamma(+paramArray[0], +paramArray[1]);
        case "weibull":
            return +randObject.weibull(+paramArray[0],+paramArray[1]);
        case "uniform":
            return +randObject.uniform(+paramArray[0], +paramArray[1]);
        case "exponential":
            return +randObject.exponential(+paramArray[0]);
        case "pareto":
            return +randObject.pareto(+paramArray[0]);
        case "constant":
            return +paramArray[0];
        
        default:
            return randObject.random();
    }
}

/* adapter functions so that frontend can communicate with backend */
function pullFromForm(model){
    switch(model.view.type){
        case "source":
            model.update();
            model.distribution = model._params[0][0];
            model.params = [model._params[0][1], model._params[0][2]];
            /* is the model a source entity */
            if(model.udoFields && USE_UDO){
                /* frontend promises that the _params array is in the order of LIST_OF_PARAMETERS */
                for(var i = 0; i < LIST_OF_PARAMETERS.length; i++){
                    model.udoFields[LIST_OF_PARAMETERS[i][0]].distribution = model._params[i+1][0];
                    model.udoFields[LIST_OF_PARAMETERS[i][0]].params = [model._params[i+1][1], model._params[i+1][2]];
                }
            }
            break;
        case "splitfunc":
            model.fieldToCheck = model._params[0][1];
            model.op = model._params[0][2];
            model.constant = model._params[0][3];
			model.prob = model._params[0][4];
            model.createFuncString();
            break;
        case "func":
            model.fieldToEdit = model._params[0][1];
            model.op = model._params[0][2];
            model.constant = model._params[0][3];
            model.createFuncString();
            break;
        case "queue":
        case "stack":
            if(model._params[0][1]){
                /* isUDO */
                model.distribution = "custom";
                model.params = [model._params[0][2], null];
                model.UDO_selected = true;
            } else {
                /* isNotUDO */
                model.distribution = model._params[0][2];
                model.params = [ model._params[0][3], model._params[0][4] ];
                model.UDO_selected = false;
            }
            model.maxqlen = model._params[1][1];
            model.nservers = model._params[2][1];
            break;
    }
}

/* adapter function so that backend can communicate with frontend */
function pushToForm(model){
    switch(model.view.type){
        case "source":
            model.update();
            model._params = [[model.distribution, model.params[0], model.params[1]]];
            if(model.udoFields){
                for(f in model.udoFields){
                    model._params.push([model.udoFields[f].distribution, model.udoFields[f].params[0], model.udoFields[f].params[1]]);
                }
            }
            break;
        case "splitfunc":
            model._params = [[ "func", model.fieldToCheck, model.op, model.constant, model.prob]];
            break;
        case "queue":
			model._params = [
                [ "UDO", model.UDO_selected, model.distribution, model.params[0], model.params[1] ],
                [ "const", model.maxqlen ],
                [ "const", model.nservers ]
            ];
			break;
        case "stack":
            model._params = [
                [ "UDO", model.UDO_selected, model.distribution, model.params[0], model.params[1] ],
                [ "const", model.maxqlen ],
                [ "const", model.nstacks ]
            ];
            break;
        case "func":
            model._params = [[ "func", model.fieldToEdit, model.op, model.constant ]];
            break
    }
}
