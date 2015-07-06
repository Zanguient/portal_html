/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

angular.module('servicos', [ ])

// CONSTANTES
.factory('$campos', [function(){
   return{
      administracao : {
        pessoa : {
            id_pesssoa : 100,
            nm_pessoa : 101, 
            dt_nascimento : 102,
            nu_telefone : 103,
            nu_ramal : 104
        },
        webpagescontrollers : {
            id_controller : 100,
            ds_controller: 101,
            nm_controller: 102, // nome do controller usado no angular
            fl_menu: 103, // se true, aparece como MENU raiz
            id_subController: 104, // se for filho de alguém, setar o ID dele aqui (FK)
            // Relacionamentos
            RoleId : 200
        },
        webpagesmembership : {
            UserId : 100,
            Password : 106
        },
        webpagesmethods : {
            id_method : 100,
            ds_method : 101,
            nm_method : 102,
            fl_menu : 103,
            id_controller : 104
        },
        webpagespermissions : {
            id_roles : 100,
            id_method : 101,
            fl_principal : 102,
            // Relacionamentos
            role : 200,
            method : 300,
            controller : 400
        },
        webpagesroles : {
            RoleId : 100,
            RoleName : 101
        },
        webpagesusers : {
            id_users : 100,
            ds_login : 101,
            ds_email : 102,
            id_grupo : 103,
            nu_cnpjEmpresa : 104,
            nu_cnpjBaseEmpresa : 105,
            id_pessoa : 106,
            // Relacionamentos   
            pessoa : 200,
            grupo_empresa : 300,
            empresa : 400,
            webpagesusersinroles : 500
        },
        webpagesusersinroles : {
            UserId : 100,
            RoleId : 101
        }
      },
      cliente : {
        empresa : {
            nu_cnpj : 100,
            nu_BaseCnpj : 101,
            nu_SequenciaCnpj : 102,
            nu_DigitoCnpj : 103,
            ds_fantasia : 104,
            ds_razaoSocial : 105,
            ds_endereco : 106,
            ds_cidade : 107,
            sg_uf : 108,
            nu_cep : 109,
            nu_telefone : 110,
            ds_bairro : 111,
            ds_email : 112,
            dt_cadastro : 113,
            fl_ativo : 114,
            token : 115,
            id_grupo : 116,
            filial : 117,
            nu_inscEstadual : 118
        },
        grupoempresa : {
            id_grupo : 100,
            ds_nome : 101,
            dt_cadastro : 102,
            token : 103,
            fl_cardservices : 104,
            fl_taxservices : 105,
            fl_proinfo : 106
        }
      }
   }
}])


.factory('$apis', [function(){
  return {
    autenticacao: {
      login: 'http://192.168.0.100/api/login/autenticacao/', 
      //login: 'http://api.taxservices.com.br/login/autenticacao/',
      // futuramente tirar daqui
      keyToken: 'token',
      keyLembrar: 'remember',
      keyDateTime: 'datetime'
    },
    administracao : {
        pessoa : 'http://192.168.0.100/api/administracao/pessoa/',
        webpagescontrollers : 'http://192.168.0.100/api/administracao/webpagescontrollers/',
        webpagesmembership : 'http://192.168.0.100/api/administracao/webpagesmembership/',
        webpagesmethods : 'http://192.168.0.100/api/administracao/webpagesmethods/',
        webpagespermissions : 'http://192.168.0.100/api/administracao/webpagespermissions/',
        webpagesroles : 'http://192.168.0.100/api/administracao/webpagesroles/',
        webpagesusers : 'http://192.168.0.100/api/administracao/webpagesusers/', 
        webpagesusersinroles : 'http://192.168.0.100/api/administracao/webpagesusersinroles/'
    },
    cliente: {
      empresa : 'http://192.168.0.100/api/cliente/empresa/',
      grupoempresa : 'http://192.168.0.100/api/cliente/grupoempresa/'
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
    /**
      * Obtem a url completa, considerando os parâmetros e os filtros.  
      * Se não for desejado utilizar filtro, apenas chamar a função usando dois argumentos em vez de três. 
      *
      * @param api : url da web api
      * @param parametros: apenas uma string ou um array de strings/integers
      *                    ORDEM: 0) token
      *                           1) colecao: 0 = min (default) | 1 = max
      *                           2) campoOrderBy: id do campo que define a ordenação
      *                           3) orderBy : 0 = crescente (default) | 1 = decrescente)
      *                           4) itensPorPagina : total de itens desejados para a busca
      *                           5) pagina : página a ser exibida
      * @param filtros : JSON ou array de JSON, ao qual cada elemento contem um 'id' e um 'valor'
      *                  OBS: Para between de data, passar {CODIGO_DATA : DATA_INICIO%DATA_FIM}
      */  
    getUrl : function(api, parametros, filtros){
      // Se for uma string, somente concatena ela    
      if(parametros){
          if(typeof parametros === 'string'){ 
              // Se for enviado uma string vazia, não concatena
              if(parametros.length > 0) api = api.concat(parametros + '/');
          }else{  
              // Objeto array => Concatena todos
              for(var k = 0; k < parametros.length; k++) api = api.concat(parametros[k] + '/');
          }  
      }
      
      // Filtros
      if(filtros){
         api = api.concat('?');
         // Se for array, percorre todo ele  
         if(angular.isArray(filtros)){  
             for(var k = 0; k < filtros.length; k++){ 
                 api = api.concat(filtros[k].id + '=' + filtros[k].valor);
                 if(k < filtros.length - 1) api = api.concat('&');
             }
         }else api = api.concat(filtros.id + '=' + filtros.valor); // é apenas um json
      }
    
      return api;      
    },
    /**
      * HTTP GET que retorna um promise. 
      * Para entender os outros argumentos, ver função getUrl(api, parametros, filtros)
      */                
    get: function(api, parametros, filtros) {
      // Setando o promise
      var deferido = $q.defer();
       
      var url = this.getUrl(api, parametros, filtros);

      //console.log(url);    
        
      // Requisitar informações de monitoramento
      $http.get(url)
        .success(function(dados, status, headers, config){
          deferido.resolve(dados);
        }).error(function(dados, status, headers, config){
          deferido.reject({'dados':dados,'status':status});
        });
      return deferido.promise;
    },
    /**
      * HTTP DELETE que retorna um promise. 
      * Para entender os outros argumentos, ver função getUrl(api, parametros, filtros)
      */                
    delete: function(api, filtros) {
      // Setando o promise
      var deferido = $q.defer();
       
      var url = this.getUrl(api, undefined, filtros);
      //console.log(url);    
        
      // Requisitar informações de monitoramento
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
    update: function(api, filtros, dadosFormulario){
      // Setando o promise
      var deferido = $q.defer();
      
      var url = this.getUrl(api, undefined, filtros);    
        
      // Requisitar informações de monitoramento
      $http.put(url, dadosFormulario)
        .success(function(dados, status, headers, config){
          deferido.resolve(dados);
        }).error(function(dados, status, headers, config){
          deferido.reject({'dados':dados,'status':status});
        });
      return deferido.promise; 
    },
    post: function(api, token, dadosFormulario){
      // Setando o promise
      var deferido = $q.defer();

      var url = token ? api + '?token=' + token : api;    
        
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