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
    
    $scope.extrato = undefined;                            
                                
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
    }
    
    $scope.file_changed = function(element) {

         $scope.$apply(function(scope) {
             var ofx = element.files[0];
             var reader = new FileReader();
             reader.onload = function(e) {
                 console.log("LOAD");
                 console.log(ofx);
                 console.log(e.target);
                 var ofxParts = e.target.result.split("\r?\n\r?\n");
                 console.log(ofxParts);
             };
             reader.readAsText(ofx, 'UTF-8');//readAsDataURL(ofx);
         });
    }
    
}]);