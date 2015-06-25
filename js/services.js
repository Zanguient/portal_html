/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

angular.module('servicos', [ ])

// CONSTANTES
.constant('$campos', {
    DT_CRIACAO: 100,
    DS_FANTASIA: 101
})


.factory('$apis', [function(){
  return {
    autenticacao: {
      login: 'http://api.taxservices.com.br/login/autenticacao/',
      keyToken: 'token',
      keyLembrar: 'remember',
      keyDateTime: 'datetime'
    },
    monitor: {
      monitor: 'http://api.taxservices.com.br/monitor/',
      pos: {
        badges: 'http://api.taxservices.com.br/monitor/cargas/pos/contador/',
        execucao: 'http://api.taxservices.com.br/monitor/cargas/pos/execucao/',
        fila: 'http://api.taxservices.com.br/monitor/cargas/pos/fila/',
        erro: 'http://api.taxservices.com.br/monitor/cargas/pos/erro/',
        sucesso: 'http://api.taxservices.com.br/monitor/cargas/pos/sucesso/',
        novaCarga: 'http://api.taxservices.com.br/monitor/cargas/pos/novacarga/' 
      },
      tef: {
        execucao: 'http://api.taxservices.com.br/monitor/cargas/pos/erro/',
        fila: 'http://api.taxservices.com.br/monitor/cargas/pos/sucesso/'
      }
    },
    clientes: {
      grupos: {
        geral: 'http://192.168.0.100/api/cliente/grupoempresa/',
        cardServices: 'http://api.taxservices.com.br/kpi/cliente/1/s', //'http://192.168.0.100/api/cliente/grupoempresa/',
        semCardServices: 'http://192.168.0.100/api/cliente/grupoempresa/',
        TaxServices: 'http://192.168.0.100/api/cliente/grupoempresa/',
        semTaxServices: '',
        ProInfo: '',
        semProInfo: ''
      },
      filiais: '',
      adquirentes: ''
    }
  }
}])



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

.factory('$webapi', ['$q', '$http', function($q, $http) {
  return {
    get: function(api, token) {
      // Setando o promise
      var deferido = $q.defer();
      
      // Requisitar informações de monitoramento
      $http.get(api)
        .success(function(dados, status, headers, config){
          console.log('log de sucesso: ');
          console.log(dados);
          console.log(status);
          console.log(headers);
          console.log(config);
          deferido.resolve(dados);
        }).error(function(dados, status, headers, config){
          console.log('log de erro: ');
          console.log(dados);
          console.log(status);
          console.log(headers);
          console.log(config);
          deferido.reject(dados);
        })
      return deferido.promise;
    },
    update: function(api, token, id, dadosFormulario){
      // Setando o promise
      var deferido = $q.defer();
      
      // Requisitar informações de monitoramento
      $http.put(api + id, dadosFormulario)
        .success(function(dados){
          deferido.resolve(dados);
        }).error(function(erro){
          deferido.reject(erro);
        })
      return deferido.promise; 
    },
    post: function(api, token, dadosFormulario){
      // Setando o promise
      var deferido = $q.defer();
      
      // Requisitar informações de monitoramento
      //$http.post('/api/monitor/cargas/pos/novacarga/', dadosFormulario)
      $http.post(api, dadosFormulario)
        .success(function(dados){
          deferido.resolve(dados);
        }).error(function(erro){
          deferido.reject(erro);
        })
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


// Extras

.factory('$autenticacao', ['$localstorage', '$apis', function($localstorage,$apis){
  return {
    // Tempo em horas máximos definido de inatividade para requerer novo login, caso LEMBRAR não foi marcado
    HORAS_NOVO_LOGIN : 2,
    // Obtém o JSON que contém a resposta do server para a última autenticação válida
    getToken: function(){
        return $localstorage.get($apis.autenticacao.keyToken);
    },
    // Retorna true se o usuário está autenticado (isto é, não é necessário um novo login)
    usuarioEstaAutenticado: function(){
        // Obtém dados de autenticação
        var token = this.getToken();
        // Verifica se tem token
        if(token){ 
            // Obtém os indicadores de persistir a autenticação (LEMBRAR === true)
            var lembrar = $localstorage.get($apis.autenticacao.keyLembrar) || false;
            var time = $localstorage.get($apis.autenticacao.keyDateTime) || new Date(); 
            if(typeof time === 'string') time = new Date(time); // DateTime é armazenado em string no localstorage
            // Obtém DateTime atual
            var timeNow = new Date();
            var millisecondsPerHour = 1000 * 60 * 60; // total de milisegundos em 1 hora
            var millisBetween = timeNow.getTime() - time.getTime(); // diferença em milisegundos entre o horário atual e o armazenado
            var differenceInHours = millisBetween / millisecondsPerHour; // diferença em horas
            // Retorna true se não é necessário um novo login
            return lembrar || differenceInHours < HORAS_NOVO_LOGIN; 
        }
        return false;
    },
    // Remove da base os dados referentes à autenticação
    removeDadosDeAutenticacao: function(){
        $localstorage.delete($apis.autenticacao.keyLembrar);
        $localstorage.delete($apis.autenticacao.keyToken);
        $localstorage.delete($apis.autenticacao.keyDateTime);
    },
    // Atualiza o último datetime de autenticação   
    atualizaDateTimeDeAutenticacao: function(datetime){
        $localstorage.set($apis.autenticacao.keyDateTime, datetime);
    },
    atualizaToken : function(token){
        $localstorage.set($apis.autenticacao.keyToken, token);
    },
    // Atualiza os dados referentes à autenticação
    atualizaDadosDeAutenticacao: function(token,lembrar,datetime){
        this.atualizaToken(token);
        $localstorage.set($apis.autenticacao.keyLembrar, lembrar);
        this.atualizaDateTimeDeAutenticacao(datetime);
    }
  }
}])