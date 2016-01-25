/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 03/09/2015
 *
 */

// App
angular.module("dashboard", []) 

.controller("dashboardCtrl", ['$scope',
                              '$state',
                              '$timeout',
                              '$webapi',
                              '$apis',
                            function($scope,$state,$timeout,$webapi,$apis){ 
    
    $scope.extrato = undefined;   
    // Flags
    $scope.exibeTela = false;                           
                                
    // Inicialização do controller
    $scope.dashboardInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Dashboard';                          
        $scope.pagina.subtitulo = 'Resumo do dia';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega dados
            // ....
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
    }
    
    
}]);