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
        // Carrega o layout
        // ...
    };
    
}]);