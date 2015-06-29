/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("dashboard", []) 

.controller("dashboardCtrl", ['$scope','$state',
                            function($scope,$state){ 
                                                        
    // Inicialização do controller
    $scope.dashboardInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Dashboard';                          
        $scope.pagina.subtitulo = 'Resumo do dia';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state){
            $state.go(state);
        });
    };
    
}]);