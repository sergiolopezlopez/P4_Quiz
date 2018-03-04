
const model = require ('./model');
const {log, biglog, errorlog, colorize} = require("./out");


exports.helpCmd = rl => {
	log("Comandos:");
	log("  h|help - Muestra esta ayuda.");
	log("  list - Listar los quizzes existentes.");
	log("  show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
	log("  add - Añadir un nuevo quiz interactivamente.");
	log("  delete <id> - Borrar el quiz indicado.");
	log("  edit <id> - Editar el quiz indicado.");
	log("  test <id> - Probar el quiz indicado.");
	log("  p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
	log("  credits - Créditos.");
	log("  q|quit - Salir del programa.");
	rl.prompt();
};

exports.listCmd = rl => {
	model.getAll().forEach((quiz,id)=> {
		log(`[${colorize(id, 'magenta')}]: ${quiz.question}`);
	});
	rl.prompt();
};

exports.showCmd = (rl,id) => {
	if(typeof id === "undefined"){
		errorlog(`Falta el parámetro id.`);
	} else {
		try{
			const quiz=model.getByIndex(id);
			log(`[${colorize(id,'magenta')}]: ${quiz.question} ${colorize("=>","magenta")} ${quiz.answer}`);
		}
		catch(error){
			errorlog(error.message);
		}
	}
	rl.prompt();
	
};

exports.addCmd = rl  => {
	rl.question(colorize(' Introduzca una pregunta: ', 'red'), question =>{
		rl.question(colorize(' Introduzca la respuesta: ','red') ,answer =>{
			model.add(question,answer);
			log(` ${colorize('Se ha añadido','magenta')}: ${question} ${colorize('=>','magenta')} ${answer}`);
			rl.prompt();
		});
	});
};

exports.deleteCmd = (rl,id) => {
	if(typeof id === "undefined"){
		errorlog(`Falta el parámetro id.`);
	} else {
		try{
			model.deleteByIndex(id);
		}
		catch(error){
			errorlog(error.message);
		}
	}
	rl.prompt();	
};

exports.editCmd = (rl,id)=> {
	if(typeof id === "undefined"){
		errorlog(`Falta el parámetro id.`);
		rl.prompt();
	} else {
		try{

			const quiz = model.getByIndex(id);
			process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);

			rl.question(colorize(' Introduzca una pregunta: ', 'red'), question =>{

				process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);

				rl.question(colorize(' Introduzca la respuesta: ','red') ,answer =>{
					model.update(id,question,answer);
					log(` Se ha cambiado el quiz ${colorize(id,'magenta')} por: ${question} ${colorize('=>','magenta')} ${answer}`);
					rl.prompt();
				});
			});
		}
		catch(error){
			errorlog(error.message);
			rl.prompt();
		}
	}	
	
};

exports.testCmd = (rl,id)  => {
	if(typeof id === "undefined"){
		errorlog(`Falta el parámetro id.`);
		rl.prompt();
	} else {
		try{
			const quiz = model.getByIndex(id);
			rl.question(colorize(` ${quiz.question}? `, 'red'), answer =>{
				ans1= (answer || "").trim();
				ans=ans1.toUpperCase();
				t=JSON.parse(JSON.stringify(quiz.answer));
				s= t.toUpperCase();

				if(ans===s){
					log(` Su respuesta es:`);
					biglog('Correcta', 'green');
					rl.prompt();
				}
				else{
					log(` Su respuesta es:`);
					biglog('Incorreta', 'red');
					rl.prompt();
				}
			});
		}		
		catch(error){
			errorlog(error.message);
			rl.prompt();
		}
	}
};

exports.playCmd = rl  => {
	let score = 0;
	let toBeResolved= [];
	let num=0;
	let quizzesplay = [model.quizzes];
	model.getAll().forEach((quiz,id)=> {
		toBeResolved[id]=id;
		num=num+1;
	});	

	const playOne=()=>{
		if(num===0){
			log(` No hay nada más que preguntar.`);
			log(` Fin del examen. Aciertos: `);
			biglog( `${score} `, 'magenta');
			rl.prompt();

		}  else{
			try{
				let idr = Math.random()*num;
				let ids= Math.floor(idr);
				const quiz = model.getByIndex(toBeResolved[ids]);
				toBeResolved[ids]=null;
				let m=0;

				for (var i = 0; i <num; i++) {
					if(toBeResolved[i]!== null){
						toBeResolved[m]=toBeResolved[i];
						m++;
					} 
				}

				num--;
				rl.question(colorize(` ${quiz.question}? `, 'red'),answer=>{
					ans1= (answer || "").trim();
					ans=ans1.toUpperCase();
					t=JSON.parse(JSON.stringify(quiz.answer));
					s= t.toUpperCase();

					if(ans===s){
						score=score+1;
						log(` CORRECTO - Lleva ${score} aciertos.`);
						rl.prompt();
						playOne();
					}
					else{
						log(` INCORRECTO.`);
						log(` Fin del examen. Aciertos: `);
						biglog(` ${score}`, 'magenta');
						rl.prompt();
					}
				});
			}
			catch(error){
			errorlog(error.message);
			rl.prompt();
		}
		}
	};
	playOne();
};





exports.creditsCmd = rl => {
	log("Autor de la práctica:");
	log("Sergio López López");
	rl.prompt();
};

exports.quitCmd = rl  => {
	rl.close();
};