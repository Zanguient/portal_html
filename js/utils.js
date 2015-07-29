/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

angular.module('utils', [ ])


// FUNÇÕES
.factory('$sessionstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.sessionStorage[key] = value;
    },
    get: function(key, defaultValue) {
     return $window.sessionStorage[key] || defaultValue;   
    },
    setObject: function(key, value) {
      $window.sessionStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.sessionStorage[key] || '{}');
    },
    delete: function(key){
        $window.sessionStorage.removeItem(key);
    }
  }
}])

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
     return $window.localStorage[key] || defaultValue;   
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    },
    delete: function(key){
        $window.localStorage.removeItem(key);
    }
  }
}])

/**
  * Canais de comunicação com a webapi: get, delete, put e post
  */
.factory('$webapi', ['$q', '$http', function($q, $http) {
  return {
    /**
      * HTTP GET que retorna um promise
      */                
    get: function(url) {
      // Setando o promise
      var deferido = $q.defer();  
        
      $http.get(url)
        .success(function(dados, status, headers, config){
          deferido.resolve(dados);
        }).error(function(dados, status, headers, config){
          deferido.reject({'dados':dados,'status':status});
        });
      return deferido.promise;
    },
    /**
      * HTTP DELETE que retorna um promise
      */                
    delete: function(url) {
      // Setando o promise
      var deferido = $q.defer();
        
      $http.delete(url)
        .success(function(dados, status, headers, config){
          deferido.resolve(dados);
        }).error(function(dados, status, headers, config){
          deferido.reject({'dados':dados,'status':status});
        }); 
      return deferido.promise;
    },
    /**
      * HTTP PUT que retorna um promise
      */   
    update: function(url, dadosFormulario){
      // Setando o promise
      var deferido = $q.defer(); 
        
      $http.put(url, dadosFormulario)
        .success(function(dados, status, headers, config){
          deferido.resolve(dados);
        }).error(function(dados, status, headers, config){
          deferido.reject({'dados':dados,'status':status});
        });   
      return deferido.promise; 
    },
    /**
      * HTTP POST que retorna um promise
      */   
    post: function(url, dadosFormulario){
      // Setando o promise
      var deferido = $q.defer();
        
      $http.post(url, dadosFormulario)
        .success(function(dados, status, headers, config){
          deferido.resolve(dados);
        }).error(function(dados, status, headers, config){
          deferido.reject({'dados':dados,'status':status});
        });
      return deferido.promise;
    }
  }
}])

.factory('$empresa', function(){
  return {
    nome: 'Atos Capital',
    sobreResumido: 'A Atos Capital define-se como uma empresa de Consultoria de Gestão e Negócios com grande expertise nos mercados das Indústria e Varejo e atuação em empresas de grande e médio porte.',
    sobre: 'A ATOS CAPITAL define-se como uma empresa de Consultoria de Gestão e Negócios com grande expertise nos mercados das Indústria e Varejo e atuação em empresas de grande e médio porte. Por meio de seus executivos com sólida experiência de mercado, investimento em tecnologias inovadoras desenvolvidas de forma estratégica e grandes players de mercado como parceiros de negócios, agregamos valores e asseguramos resultados aos nossos clientes. Com um conjunto de processos e medidas que são implementadas em altos níveis de Gestão e SLA estabelecemos um compromisso junto ao ROI, que torna-se o principal agente gerador de confiança e respaldo de nossa empresa com o mercado',
    copyright: '© Copyright 2013-2015 Atos Capital - Consultoria de Gestão e Negócios',
    email: 'atendimento@atoscapital.com.br',
    telefone: '(79) 3042-4048',
    facebook: 'http://www.facebook.com.br/atoscapital',
    linkedin: 'http://br.linkedin.com/company/atos-capital'
  }
})



/**
  * Autenticação
  */
.factory('$autenticacao', ['$localstorage', function($localstorage){
  
  // URL base da WEBAPI
  var urlBase = 'http://192.168.0.100/api'; 
  //var urlBase = 'http://api.atoscapital.com.br';
  // Tempo em horas máximos definido de inatividade para requerer novo login, caso LEMBRAR não tenha sido marcado
  const HORAS_NOVO_LOGIN = 2;
    
  return {
    getUrlBase : function(){ return urlBase },
    // URL + keys da local storage  
    autenticacao: { 
      login: urlBase + '/login/autenticacao/',
      keyToken: 'token',
      keyLembrar: 'remember',
      keyDateTime: 'datetime'
    },     
    // Obtém o JSON que contém a resposta do server para a última autenticação válida
    getToken: function(){
        return $localstorage.get(this.autenticacao.keyToken);
    },
    // Retorna true se o usuário está autenticado (isto é, não é necessário um novo login)
    usuarioEstaAutenticado: function(){
        // Obtém dados de autenticação
        var token = this.getToken();
        // Verifica se tem token
        if(token){ 
            // Obtém os indicadores de persistir a autenticação (LEMBRAR === true)
            var lembrar = $localstorage.get(this.autenticacao.keyLembrar) || false;
            if(lembrar) return true;
            // Não foi marcado LEMBRAR => Analisa o tempo entre a última validação e o horário atual
            var time = $localstorage.get(this.autenticacao.keyDateTime) || new Date(); 
            if(typeof time === 'string') time = new Date(time); // DateTime é armazenado em string no localstorage
            // Obtém DateTime atual
            var timeNow = new Date();
            var millisecondsPerHour = 1000 * 60 * 60; // total de milisegundos em 1 hora
            var millisBetween = timeNow.getTime() - time.getTime(); // diferença em milisegundos entre o horário atual e o armazenado
            var differenceInHours = millisBetween / millisecondsPerHour; // diferença em horas
            // Retorna true se não é necessário um novo login
            return differenceInHours < HORAS_NOVO_LOGIN; 
        }
        return false;
    },
    // Remove da base os dados referentes à autenticação
    removeDadosDeAutenticacao: function(){
        $localstorage.delete(this.autenticacao.keyLembrar);
        $localstorage.delete(this.autenticacao.keyToken);
        $localstorage.delete(this.autenticacao.keyDateTime);
    },
    // Atualiza o último datetime de autenticação   
    atualizaDateTimeDeAutenticacao: function(datetime){
        $localstorage.set(this.autenticacao.keyDateTime, datetime);
    },
    atualizaToken : function(token){
        $localstorage.set(this.autenticacao.keyToken, token);
    },
    // Atualiza os dados referentes à autenticação
    atualizaDadosDeAutenticacao: function(token,lembrar,datetime){
        this.atualizaToken(token);
        $localstorage.set(this.autenticacao.keyLembrar, lembrar);
        this.atualizaDateTimeDeAutenticacao(datetime);
    }
  }
}])