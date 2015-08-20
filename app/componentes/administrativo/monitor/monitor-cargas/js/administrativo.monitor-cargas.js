/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-monitor-cargas", ['SignalR']) 

.controller("administrativo-monitor-cargasCtrl", ['$scope',
                                            '$state',
                                            '$http',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis',
                                            '$filter', 
                                            function($scope,$state,$http,/*$campos,*/
                                                     $webapi,$apis,$filter){ 
   
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyMonitorPos = 1; // posição da div que vai receber o loading progress
    $scope.itens_pagina = [10, 20, 50, 100];
    $scope.filtro = { data : new Date(),
                      itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, faixa_registros : '0-0', total_paginas : 0, 
                      campo_ordenacao : {id: 103,//$campos.administracao.logacesso.dtAcesso, 
                                         order : 1}};                                               
    // flags
    $scope.abrirCalendarioData = false;                                             
    $scope.exibeTela = false;                                            
 
                                                
    // Inicialização do controller
    $scope.administrativo_monitorCargasInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Monitor';                          
        $scope.pagina.subtitulo = 'Monitor de Cargas';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });  
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Busca
            // ...
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
    } 
    
    
    
    
    
    /* FILTRO */
    
    /**
      * Limpa os filtros
      */
    $scope.limpaFiltros = function(){
        
        // Limpar data
        $scope.filtro.datamin = new Date();
        $scope.filtro.datamax = ''; 
        
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
        console.log($scope.filtro.data);
    };
    
    
    
                                                

}])

.factory('realtimeservice',['$rootScope','$scope','Hub', '$timeout', function($rootScope, $scope, Hub, $timeout){
    
    //declaring the hub connection
    var hub = new Hub('message', {

        //client side methods
        listeners:{
            'updateMessages': function (data) {
                console.log("RECEBEU");
                console.log(data);
                $rootScope.$apply();
            }
        },

        //server side methods
        methods: ['send'],

        //query params sent on initial connection
        queryParams:{
            token: $scope.token
        },

        //handle connection error
        errorHandler: function(error){
            console.log("ERRO");
            console.error(error);
        },
        
        transport: 'webSockets',

        //specify a non default root
        //rootPath: '/api

        stateChanged: function(state){
            switch (state.newState) {
                case $.signalR.connectionState.connecting:
                    console.log("CONECTANDO...");
                    break;
                case $.signalR.connectionState.connected:
                    console.log("CONECTADO!");
                    break;
                case $.signalR.connectionState.reconnecting:
                    console.log("RECONECTANDO...");
                    break;
                case $.signalR.connectionState.disconnected:
                    console.log("DESCONECTADO!");
                    break;
            }
        }
    });

    var send = function (data) {
        hub.send("deivid", "teste"); //Calling a server method
    };

    return {
        send: send
    };
}])