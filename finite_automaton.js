//finite automaton
const epsilon=Symbol("Epsilon")
class Automaton_State{
  name;
  routes={__proto__:null}; //holds inputs mapped to lists of state names
  
  constructor(name,definitions=[]){ //definitions are pairs of [item,state_name]
    this.name=name
    for(let i=0;i<definitions.length;i++){
      const [item,state_name] = definitions[i]
      this.routes[item] ||= []
      this.routes[item].push(state_name)
    }
  }
}
class Finite_Automaton{
  static Epsilon=epsilon
  #arguments;
  #accept_count=0
  #states={__proto__:null} //holds state objects
  #current_states={__proto__:null} //holds state names
  #accept_states={__proto__:null} //holds state names
  #alphabet={__proto__:null} //holds accepted items
  
  #handle_epsilon(state,cache={__proto__:null}){
    if(cache[state.name]) return null; //if epsilon already handled
    cache[state.name]=true
    if(!state.routes[epsilon]) return null;
    for(let i=0;i<state.routes[epsilon].length;i++){
      this.#current_states[ state.routes[epsilon][i] ] ||= 0
      this.#current_states[ state.routes[epsilon][i] ]++
      const new_state = this.#states[ state.routes[epsilon][i] ]
      this.#handle_epsilon(new_state,cache)
    }
  }
  #input(item){
    if(!this.#alphabet[item]) return null; //item not in alphabet
    const keys=Object.keys(this.#current_states)
    for(let i=0;i<keys.length;i++){
      const state = this.#states[keys[i]]
      if(--this.#current_states[keys[i]]<1) delete this.#current_states[keys[i]];
      if(this.#accept_states[state.name]) this.#accept_count--;
      if(!state.routes[item]) continue; //item in alphabet but not defined in specific state
      const routes=state.routes[item]
      for(let j=0;j<routes.length;j++){
        const new_state = this.#states[ routes[j] ]
        this.#current_states[new_state.name] ||= 0
        this.#current_states[new_state.name]++
        if(this.#accept_states[new_state.name]) this.#accept_count++;
        this.#handle_epsilon(new_state)
      }
    }
  }
  read(data){
    if(typeof data!=="string") throw new TypeError("data must be a string");
    for(let i=0;i<data.length;i++) this.#input(data[i]);
    return this.current_states
  }
  reset(){
    this.#accept_count=0
    this.#states={__proto__:null} //holds state objects
    this.#current_states={__proto__:null} //holds state names
    this.#accept_states={__proto__:null} //holds state names
    this.#alphabet={__proto__:null} //holds accepted items
    this.#initialise.apply(this,this.#arguments)
  }
  get accepted(){return Boolean(this.#accept_count)}
  get current_states(){return Object.keys(this.#current_states)}
  get accept_states(){return Object.keys(this.#accept_states)}
  get alphabet(){return Object.keys(this.#alphabet)}
  
  #initialise(alphabet=[],initial_state='',accept_states=[],relations=[]){ //actually the main function of the class
    //todo: arguments error checking
    //each item in relations has [state_from,input,state_to]
    //each item in alphabet is single char
    //accept_states and initial_state have their mention(s) in relations
    for(let i=0;i<alphabet.length;i++)
      this.#alphabet[alphabet[i]] = true;
    const onboarding={__proto__:null}
    for(let i=0;i<relations.length;i++){
      const r=relations[i]
      onboarding[r[0]] ||= []
      onboarding[r[2]] ||= []
      onboarding[r[0]].push( r.slice(1) )
    }
    const state_names=Object.keys(onboarding)
    for(let i=0;i<state_names.length;i++){
      const name=state_names[i]
      const routes=onboarding[name]
      this.#states[name] = new Automaton_State(name,routes)
    }
    this.#current_states[initial_state] = true
    for(let i=0;i<accept_states.length;i++)
      this.#accept_states[accept_states[i]] = true;
    this.#accept_count = Number( accept_states.includes(initial_state) )
  }
  
  constructor(){
    this.#initialise.apply(this,arguments)
    this.#arguments=arguments
  }
}


/*class interface description begin

methods:
- reset()
- read(data: String)

values:
- accepted: Boolean whether the machine is in an accept state or not
- current_states: Array of states the machine is currently in (DFAs will always have a single state, NFAs might be in multiple states)
- accept_states: Array of states which the machine has defined as its states of acceptance
- alphabet: Array of symbols used in the language of the defined finite automaton

note that the only the relationships/definitions between states are what makes a finite automaton deterministic or not

class interface description end*/


//example usage
let dfa=new Finite_Automaton( //deterministic finite automaton
  ['0','1'],'q0',['q0'],
  [['q0','0','q1'],['q0','1','q0'],['q1','0','q0'],['q1','1','q1']]
)
console.log('DFA processing start')
console.log(dfa.read('0')) //total read: 0
console.log(dfa.read('0')) //total read: 00
console.log(dfa.read('1')) //total read: 001
console.log(dfa.read('0')) //total read: 0010
console.log(dfa.read('111100101010')) //total read: 0010111100101010
dfa.reset() //total read: NOTHING
console.log('DFA processing stop')

let nfa=new Finite_Automaton( //non deterministic finite automaton
  ['0','1'],'q1',['q4'],
  [['q1','0','q1'],['q1','1','q1'],['q1','1','q2'],['q2','0','q3'],['q2',Finite_Automaton.Epsilon,'q3'],['q3','1','q4'],['q4','0','q4'],['q4','1','q4']]
)
console.log('NFA processing start')
console.log(nfa.read('0')) //total read: 0
console.log(nfa.read('1')) //total read: 01
console.log(nfa.read('0')) //total read: 010
console.log(nfa.read('1')) //total read: 0101
console.log(nfa.read('10')) //total read: 010110
nfa.reset()
console.log('NFA processing stop')

