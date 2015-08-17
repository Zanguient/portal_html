/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-monitor-cargas", []) 

.controller("administrativo-monitor-cargasCtrl", ['$scope',
                                            '$state',
                                            '$http',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis',
                                            '$filter', 
                                            function($scope,$state,$http,/*$campos,*/
                                                     $webapi,$apis,$filter){ 
   
    var divPortletBodyLogsPos = 0; // posição da div que vai receber o loading progress

    // flags
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
                                                

}])