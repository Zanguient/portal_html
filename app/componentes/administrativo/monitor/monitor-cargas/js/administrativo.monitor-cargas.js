/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-monitor-cargas", ['SignalR']) 

.factory('monitorService',
    ["$http", "$rootScope", "$location", "Hub", "$timeout",
    function ($http, $rootScope, $location, Hub, $timeout) {
        
        var monitor = this;
        
        var conectado = false;

        //jQuery.support.cors = true;
        
        var options = {
            
            rootPath : 'http://localhost:50780/signalr',
            
            listeners: {
                'enviaMudancas': function (mudancas) {
                    //console.log("NOTIFY CARGA");console.log(mudancas);
                    $rootScope.$broadcast("notifyMonitorMudancas", mudancas);
                },
                'enviaLista': function (lista) {
                    $rootScope.$broadcast("notifyMonitorLista", lista);
                }
            },

            methods: ['obtemLista'],
            
            queryParams:{
                'token': $rootScope.token
            },
            
            errorHandler: function (error) {
                console.log("ERRO");
                console.log(error);
                conectado = false;
            },
            /*hubDisconnected: function () {
                if (hub.connection.lastError) {
                    hub.connection.start();
                }
            },*/
            jsonp : true,
            transport: 'webSockets', //'longPolling'
            logging: false,
            
            stateChanged: function(state){
                switch (state.newState) {
                    case $.signalR.connectionState.connecting:
                        console.log("CONECTANDO...");
                        conectado = false;
                        break;
                    case $.signalR.connectionState.connected:
                        //console.log("CONECTADO!");
                        conectado = true;
                        $rootScope.$broadcast("notifyMonitorConnectionStatus", true);
                        //monitor.conectado();
                        break;
                    case $.signalR.connectionState.reconnecting:
                        console.log("RECONECTANDO...");
                        conectado = false;
                        break;
                    case $.signalR.connectionState.disconnected:
                        //console.log("DESCONECTADO!");
                        conectado = false;
                        $rootScope.$broadcast("notifyMonitorConnectionStatus", false);
                        break;
                }
            }
        };
        
        //Hub setup
        //var hub = new Hub("ServerAtosCapital", options);
        

        var getAnoMesCorrente = function(){
            var dt = new Date();
            var mes = dt.getMonth() + 1;
            var ano = dt.getFullYear();
            if(mes < 10) return ano + "0" + mes;
            return ano + "" + mes;    
        }

        monitor.isConnected = function(){
            return conectado;    
        }
        
        monitor.conectar = function(){
            if(!conectado || !hub || hub === null) hub = new Hub("ServerAtosCapital", options); 
            else $rootScope.$broadcast("notifyMonitorConnectionStatus", true);
        }
        
        // Filtros
        var filtroMonitorCargas = {data : getAnoMesCorrente(),
                                   status : 0,
                                   idGrupo : 0,
                                   nuCnpj: '',
                                   cdAdquirente : 0 };
        
        monitor.getTotalDiasMesFiltrado = function(){
            var mes = parseInt(filtroMonitorCargas.data.substr(4, 2));
            if(mes === 4 || mes === 6 || mes === 9 || mes === 11) return 30;
            if(mes === 1 || mes === 3 || mes === 5 || mes === 7 || mes === 8 || mes === 10 || mes === 12) return 31;
            var ano = parseInt(filtroMonitorCargas.data.substr(0, 4));
            if(ano % 4 === 0) return 29;
            return 28;
        }
        
        /**
          * Função que notifica ao servidor que está monitorando
          */
        monitor.obtemLista = function (filtro) {
            if(filtro && filtro !== null){
                if(filtro.data && filtro.data.length === 6) filtroMonitorCargas.data = filtro.data;
                if(typeof filtro.idGrupo === 'number') filtroMonitorCargas.idGrupo = filtro.idGrupo;
                if(typeof filtro.nuCnpj === 'string') filtroMonitorCargas.nuCnpj = filtro.nuCnpj;
                if(typeof filtro.status === 'number') filtroMonitorCargas.status = filtro.status;
                if(typeof filtro.cdAdquirente === 'number') filtroMonitorCargas.cdAdquirente = filtro.cdAdquirente;
            }
            //hub.conectado(monitor.data); //Calling a server method
            hub.obtemLista(filtroMonitorCargas);
        };
        /**
          *
          */
        monitor.desconectar = function(){
            hub.connection.stop();    
        };
        
        return monitor;
    }])

.controller("administrativo-monitor-cargasCtrl", ['$scope',
                                            '$rootScope',
                                            '$state',
                                            '$http',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis',
                                            '$filter', 
                                            'monitorService',      
                                            function($scope,$rootScope,$state,$http,/*$campos,*/
                                                     $webapi,$apis,$filter,monitorService){ 
   
    $scope.monitor = monitorService;                                         
    $scope.monitorCargas = [];   
    $scope.filiais = [];
    $scope.adquirentes = [];                                            
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyMonitorPos = 1; // posição da div que vai receber o loading progress
    $scope.itens_pagina = [50, 100, 150, 200];
    $scope.statuscarga = [{id: 1, valor: 'NÃO CARREGADO'},
                          {id: 2, valor: 'CARREGADO COM SUCESSO'},
                          {id: 3, valor: 'CARREGADO COM ERRO'},
                          {id: 4, valor: 'ERRO DE SENHA'}];
    $scope.filtro = { data : new Date(), status : null,
                      filial : null, adquirente : null,
                      itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, faixa_registros : '0-0', total_paginas : 0, 
                      campo_ordenacao : {id: 103,//$campos.administracao.logacesso.dtAcesso, 
                                         order : 1}};                                               
    // flags
    $scope.abrirCalendarioData = false;                                             
    $scope.exibeTela = false;  
    var obtendoLista = false; 
    var conectando = false;                                            
 
                                                
    // Inicialização do controller
    $scope.administrativo_monitorCargasInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Monitor';                          
        $scope.pagina.subtitulo = 'Monitor de Cargas';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $scope.monitor.desconectar();
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            if($scope.exibeTela){
                // Avalia grupo empresa
                if($scope.usuariologado.grupoempresa){ 
                    // Reseta seleção de filtro específico de empresa
                    $scope.filtro.filial = $scope.filtro.adquirente = null;
                    buscaFiliais();
                }else{ // reseta tudo e não faz buscas 
                    $scope.monitorCargas = []; 
                    $scope.filiais = [];
                    $scope.adquirentes = [];
                    $scope.filtro.filial = $scope.filtro.adquirente = null;
                }
                
            }
        }); 
        $rootScope.$on('notifyMonitorMudancas', function(event, mudancas){
            console.log("RECEBEU MUDANÇAS");
            console.log(mudancas);
            //$rootScope.$apply();
        });
        $rootScope.$on('notifyMonitorLista', function(event, lista){
            //console.log("RECEBEU LISTA");
            obtendoLista = false;
            // Prepara a lista para exibição
            atualizaListaMonitorCargas(lista);
            // Esconde Progress
            $scope.hideProgress(divPortletBodyFiltrosPos);
            $scope.hideProgress(divPortletBodyMonitorPos);
            //$rootScope.$apply();
        });
        $rootScope.$on('notifyMonitorConnectionStatus', function(event, conectado){
            conectando = false;
            if(conectado){ 
                console.log("CONECTADO");
                obtendoLista = true;
                $scope.monitor.obtemLista(obtemFiltroBusca());
            }else console.log("NÃO CONECTADO!"); 
            //$rootScope.$apply();
        });
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Busca
            buscaFiliais();
            // Conecta e obtém lista
            //$scope.showProgress(divPortletBodyFiltrosPos, 10000);
            $scope.showProgress(divPortletBodyMonitorPos);
            $scope.monitor.conectar();
        });
        // Acessou a tela
        //$scope.$emit("acessouTela");
        $scope.exibeTela = true;
        buscaFiliais();
        $scope.showProgress(divPortletBodyFiltrosPos, 10000);
        $scope.showProgress(divPortletBodyMonitorPos);
        conectando = true;
        $scope.monitor.conectar(); 
    } 
    
    
    
    
    
    
    /* FILTRO */
    
    $scope.totalDiasMesFiltrado = function(){
        return $scope.monitor.getTotalDiasMesFiltrado();    
    }
    
    var obtemFiltroBusca = function(){
        var filtro = {data : $scope.getFiltroData($scope.filtro.data, true),
                      status : 0,
                      idGrupo : 0,
                      nuCnpj: '',
                      cdAdquirente : 0 };
        // Status
        if($scope.filtro.status && $scope.filtro.status !== null) 
            filtro.status = $scope.filtor.status.id; 
        // Grupo Empresa
        if($scope.usuariologado.grupoempresa && $scope.usuariologado.grupoempresa !== null)
            filtro.idGrupo = $scope.usuariologado.grupoempresa.id_grupo;
        // Filial
        if($scope.filtro.filial && $scope.filtro.filial !== null) 
            filtro.nuCnpj = $scope.filtro.filial.nu_cnpj;
        // Adquirente
        if($scope.filtro.adquirente && $scope.filtro.adquirente !== null) 
            filtro.cdAdquirente = $scope.filtro.adquirente.id;
        
        return filtro;
    }
    
    /**
      * Limpa os filtros
      */
    $scope.limpaFiltros = function(){
        
        // Limpar data
        //$scope.filtro.data = new Date();
        
        $scope.filtro.filial = $scope.filtro.adquirente = $scope.filtro.status = null;
        
        // Relista
        obtemListaMonitorCarga();
        
    }
    
    // DATA
    $scope.exibeCalendario = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendario = !$scope.abrirCalendario;
    };
    $scope.alterouData = function(){
        //console.log($scope.filtro.data);
    };

    // FILIAIS
    /**
      * Busca as filiais
      */
    var buscaFiliais = function(nu_cnpj, idOperadora){
        
       $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = undefined;

       // Filtro do grupo empresa => barra administrativa
       if($scope.usuariologado.grupoempresa){ 
           filtros = [{id: /*$campos.cliente.empresa.id_grupo*/ 116, valor: $scope.usuariologado.grupoempresa.id_grupo}];
           if($scope.usuariologado.empresa) filtros.push({id: /*$campos.cliente.empresa.nu_cnpj*/ 100, 
                                                          valor: $scope.usuariologado.empresa.nu_cnpj});
       }
       
       $webapi.get($apis.getUrl($apis.cliente.empresa, 
                                [$scope.token, 0, /*$campos.cliente.empresa.ds_fantasia*/ 104],
                                filtros)) 
            .then(function(dados){
                $scope.filiais = dados.Registros;
                // Reseta
                if(!nu_cnpj) $scope.filtro.filial = null;//$scope.filiais[0];
                else $scope.filtro.filial = $filter('filter')($scope.filiais, function(f) {return f.nu_cnpj === nu_cnpj;})[0];
                if($scope.filtro.filial && $scope.filtro.filial !== null)
                    buscaAdquirentes(true, idOperadora); // Busca adquirentes
                else if(!conectando && !obtendoLista)
                    $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter filiais (' + failData.status + ')', true, 'danger', true);
                 if(!conectando && !obtendoLista) $scope.hideProgress(divPortletBodyFiltrosPos);
              });     
    };
    /**
      * Selecionou uma filial
      */
    $scope.alterouFilial = function(){
        //console.log($scope.filtro.filial); 
        buscaAdquirentes(false);
    };
    
                                                                                         
    // ADQUIRENTES 
    /**
      * Busca as adquirentes
      */
    var buscaAdquirentes = function(progressEstaAberto, idOperadora){
 
       if(!$scope.filtro.filial || $scope.filtro.filial === null){
           $scope.filtro.adquirente = null;
           return;
       }    
        
       if(!progressEstaAberto) $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = undefined;


       // Filtro do grupo empresa => barra administrativa
       filtros = {id: 300,
                 //id: $campos.pos.operadora.empresa + $campos.cliente.empresa.nu_cnpj - 100, 
                  valor: $scope.filtro.filial.nu_cnpj};
       
       $webapi.get($apis.getUrl($apis.pos.operadora, 
                                [$scope.token, 0, /*$campos.pos.operadora.nmOperadora*/ 101],
                                filtros)) 
            .then(function(dados){
                $scope.adquirentes = dados.Registros;
                // Reseta
                if(!idOperadora) $scope.filtro.adquirente = null;
                else $scope.filtro.adquirente = $filter('filter')($scope.adquirentes, function(a) {return a.id === idOperadora;})[0];
                if(!conectando && !obtendoLista) $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter adquirentes (' + failData.status + ')', true, 'danger', true);
                 if(!conectando && !obtendoLista) $scope.hideProgress(divPortletBodyFiltrosPos);
              });        
    }
    /**
      * Selecionou uma adquirente
      */
    $scope.alterouAdquirente = function(){
        // ...
    };
        
                                                
                                                
                                                
    // MONITOR DE CARGAS
    var obtemListaMonitorCargas = function(){
        if($scope.monitor && $scope.monitor !== null){
            $scope.showProgress(divPortletBodyFiltrosPos, 10000);
            $scope.showProgress(divPortletBodyMonitorPos);
            if($scope.monitor.isConnected) $scope.monitor.obtemLista(obtemFiltroBusca());
            else $scope.monitor.conectar();
        }
    }
    
    var atualizaListaMonitorCargas = function(lista){
        var oldlist = [];
        angular.copy(lista, oldlist);
        console.log("LISTA");console.log(oldlist);
        for(var k = 0; k < lista.length; k++){
            var loginoperadora = lista[k];
            //console.log(loginoperadora);
            // Coloca para todos os dias
            var logs = [];
            var cont = 0;
            var logExecution = loginoperadora.logExecution[cont];
            //console.log(logExecution);
            var dt = $scope.getDataString(logExecution.dtaFiltroTransacoes);
            var dia = parseInt(dt.substr(0, dt.indexOf('/')));
            //console.log("DIA L: " + dia);
            for(var d = 1; d <= 31; d++){
                 //console.log("DIA: " + d + " ? A " + dia);   
                 if(d === dia){
                     logs.push(logExecution);
                     //console.log("TEM!");
                     if(cont < loginoperadora.logExecution.length - 1){
                         logExecution = loginoperadora.logExecution[++cont];
                         //console.log(logExecution);
                         dt = $scope.getDataString(logExecution.dtaFiltroTransacoes);
                         dia = parseInt(dt.substr(0, dt.indexOf('/')));
                         //console.log("NEW DIA L: " + dia);
                     }
                 }else{
                     logs.push({});
                     //console.log("NAO TEM!");    
                 }
            }
            loginoperadora.logExecution = logs;
        }
        $scope.monitorCargas = lista;
        console.log("MONITOR CARGAS");console.log($scope.monitorCargas);
        
        // Set valores de exibição
        $scope.filtro.total_registros = $scope.monitorCargas.length;
        $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
        if($scope.monitorCargas.length === 0) $scope.filtro.faixa_registros = '0-0';
        else{
            var registroInicial = ($scope.filtro.pagina - 1)*$scope.filtro.itens_pagina + 1;
            var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
            if(registroFinal > $scope.filtro.total_registros) registroFinal = $scope.filtro.total_registros;
            $scope.filtro.faixa_registros =  registroInicial + '-' + registroFinal;
        }

        // Verifica se a página atual é maior que o total de páginas
        if($scope.filtro.pagina > $scope.filtro.total_paginas)
            setPagina(1); // volta para a primeira página e refaz a busca
        
        $rootScope.$apply();
    }
                                                
                                                

}]);