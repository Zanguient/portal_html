/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("dashboard", []) 

.controller("dashboardCtrl", ['$scope','$state','$timeout',
                            function($scope,$state,$timeout){ 
                                                        
    // Inicialização do controller
    $scope.dashboardInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Dashboard';                          
        $scope.pagina.subtitulo = 'Resumo do dia';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
         // Focus
         /*$timeout(function() {
             jQuery('body').trigger('click');
          }, 500);*/
    };
    
}]);