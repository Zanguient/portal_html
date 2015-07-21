/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-filiais-cadastro", []) 

.controller("administrativo-filiais-cadastroCtrl", ['$scope',
                                                     '$state',
                                                     '$stateParams',
                                                     '$timeout',
                                                     '$http',
                                                     '$campos',
                                                     '$webapi',
                                                     '$apis',
                                                     '$filter', 
                                                     function($scope,$state,$stateParams,$timeout,$http,$campos,
                                                              $webapi,$apis,$filter){ 
    
    var divPortletBodyFilialCadPos = 0; // posição da div que vai receber o loading progress                                                               
    $scope.tela = {tipo:'Cadastro', acao:'Cadastrar'};
    // Tab
    $scope.tabCadastro = 1;
    // Dados
    $scope.old = {};

    
                                                      
    /**
      * Inicialização do controller
      */
    $scope.administrativoFiliaisCadastroInit = function(){
        // Verifica se tem parâmetros
        if($stateParams.filial !== null){
            $scope.tela.tipo = 'Alteração'; 
            $scope.tela.acao = 'Alterar';
            console.log("alteração");
        } 
        // Título da página
        $scope.pagina.titulo = 'Gestão de Empresas';                          
        $scope.pagina.subtitulo = $scope.tela.tipo + ' de Filial';
                                                  
        $scope.$on('mudancaDeRota', function(event, state, params){
            // Obtem o JSON de mudança
            var jsonMudanca = {state: state, params : params};            
            // Verifica se possui dados preenchidos
            if($scope.ehCadastro()){
                /*if($scope.pessoa.nome || $scope.pessoa.data_nasc || $scope.pessoa.telefone || $scope.pessoa.ramal || 
                   $scope.usuario.email || $scope.usuario.empresa || $scope.usuario.grupoempresa || $scope.usuario.login ||
                   $scope.temRoleSelecionada){
                    // Exibe um modal de confirmação
                    $scope.showModalConfirmacao('Confirmação', 
                         'Tem certeza que deseja descartar as informações preenchidas?',
                         mudaEstado, {state: state, params : params},
                         'Sim', 'Não');
                }else*/ $state.go(state, params);
            }else{
               // Verifica se teve alterações
               //if(!houveAlteracoes()) 
                $state.go(state, params); // não houve alterações  
               /*else{ 
                   // Houve alterações!
                   $scope.showModalConfirmacao('Confirmação', 
                         'Tem certeza que deseja descartar as informações alteradas?',
                         mudaEstado, {state: state, params : params},
                         'Sim', 'Não');
               }*/
            }
        });
    };
    /**
      * Altera o estado, enviado pelo json => usado no modal de confirmação
      */
    var mudaEstado = function(json){
        $timeout(function(){$state.go(json.state, json.params);}, 500); // espera o tempo do modal se desfazer 
    }
    
    /**
      * True se for cadastro. False se for alteração
      */
    $scope.ehCadastro = function(){
        return $scope.old.filial === null;    
    };
    
    
}]);